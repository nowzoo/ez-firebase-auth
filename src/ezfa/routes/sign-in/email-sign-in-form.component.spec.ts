import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FormBuilder } from '@angular/forms';
import { Messages } from '../messages.enum';
import * as HELPER from '../../test';
import { EzfaService } from '../../ezfa.service';

import { EmailSignInFormComponent } from './email-sign-in-form.component';

describe('EmailSignInFormComponent', () => {
  let component: EmailSignInFormComponent;
  let fixture: ComponentFixture<EmailSignInFormComponent>;
  let service: any;

  beforeEach(() => {
    service = HELPER.getMockService();
    TestBed.configureTestingModule({
      imports: [...HELPER.MOCK_IMPORTS],
      declarations: [
        EmailSignInFormComponent,
        ...HELPER.MOCK_UTILITIES_DECLARATIONS
      ],
      providers: [
        {provide: EzfaService, useValue: service},
        {provide: FormBuilder, useValue: new FormBuilder()}
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(EmailSignInFormComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set an id', () => {
      component.ngOnInit();
      expect(component.id).toBeTruthy();
    });
    it('should set up the fg with email and password controls', () => {
      component.ngOnInit();
      expect(component.fg.get('email')).toBeTruthy();
      expect(component.fg.get('password')).toBeTruthy();
    });
    it('should set the value of the email to a value passed in input', () => {
      component.email = 'foo@bar.com';
      component.ngOnInit();
      expect(component.fg.get('email').value).toBe(component.email);
    });
    it('should set up the signUpFg', () => {
      component.ngOnInit();
      expect(component.signUpFg).toBeTruthy();
    });
    it('should add a name control if requireDisplayName', () => {
      component.service.requireDisplayName = true;
      component.ngOnInit();
      expect(component.signUpFg.get('name')).toBeTruthy();
    });
    it('should not add a name control if ! requireDisplayName', () => {
      component.service.requireDisplayName = false;
      component.ngOnInit();
      expect(component.signUpFg.get('name')).toBe(null);
    });
    it('should add a tos control if requireTos', () => {
      component.service.requireTos = true;
      component.ngOnInit();
      expect(component.signUpFg.get('tos')).toBeTruthy();
    });
    it('should not add a tos control if ! requireTos', () => {
      component.service.requireTos = false;
      component.ngOnInit();
      expect(component.signUpFg.get('tos')).toBe(null);
    });

    it('should clear the auth/weak-password error when the input changes', () => {
      component.ngOnInit();
      const fc = component.fg.get('password');
      fc.setValue('foo');
      fc.setErrors({'auth/weak-password': true});
      expect(fc.hasError('auth/weak-password')).toBe(true);
      fc.setValue('bar');
      expect(fc.hasError('auth/weak-password')).toBe(false);
    });
    it('should clear the auth/wrong-password error when the input changes', () => {
      component.ngOnInit();
      const fc = component.fg.get('password');
      fc.setValue('foo');
      fc.setErrors({'auth/wrong-password': true});
      expect(fc.hasError('auth/wrong-password')).toBe(true);
      fc.setValue('bar');
      expect(fc.hasError('auth/wrong-password')).toBe(false);
    });
    it('should fetch the providers when the email input value changes, debounced', fakeAsync(() => {
      component.ngOnInit();
      spyOn(component, 'fetchAccountByEmail').and.callFake(() => {});
      const fc = component.fg.get('email');
      fc.setValue('foo@bar.com');
      expect(component.fetchAccountByEmail).not.toHaveBeenCalled();
      tick(EmailSignInFormComponent.FETCH_TIMEOUT);
      expect(component.fetchAccountByEmail).toHaveBeenCalled();
    }));
    it('should fetch the providers when the email input status changes, debounced', fakeAsync(() => {
      component.ngOnInit();
      spyOn(component, 'fetchAccountByEmail').and.callThrough();
      component.fg.get('email').setErrors(null);
      component.fg.get('email').updateValueAndValidity();
      tick(EmailSignInFormComponent.FETCH_TIMEOUT);
      expect(component.fetchAccountByEmail).toHaveBeenCalled();
    }));

  });

  describe('fetchAccountByEmail', () => {
    let fetchSpy;
    let fc;
    beforeEach(() => {
      component.fg = component.fb.group({email: ['']});
      fc = component.fg.get('email');
      component.accountExists = false;
      component.accountExistsWithoutPassword = false;
      component.accountOauthProviders = [];
      fetchSpy = spyOn(component.service.auth, 'fetchProvidersForEmail').and.callThrough();
    });
    it('should reset everything and not fetch if the email control is invalid ', fakeAsync(() => {
      component.accountExists = true;
      component.accountExistsWithoutPassword = true;
      component.accountOauthProviders = ['twitter.com'];
      fc.setErrors({invalid: true});
      expect(fc.invalid).toBe(true);
      component.fetchAccountByEmail();
      expect(component.accountExists).toBe(false);
      expect(component.accountExistsWithoutPassword).toBe(false);
      expect(component.accountOauthProviders).toEqual([]);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(component.fetchStatus).toBe('unfetched');

    }));
    it('should fetch if the control is valid ', fakeAsync(() => {
      fc.setErrors(null);
      fc.setValue('foo@bar.com');
      expect(fc.invalid).toBe(false);
      component.fetchAccountByEmail();
      expect(fetchSpy).toHaveBeenCalledWith('foo@bar.com');
    }));
    it('should handle the case where the account does not exist ', fakeAsync(() => {
      fetchSpy.and.callFake(() => Promise.resolve([]));
      fc.setErrors(null);
      fc.setValue('foo@bar.com');
      expect(fc.invalid).toBe(false);
      component.fetchAccountByEmail();
      expect(fetchSpy).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(component.accountExists).toBe(false);
      expect(component.accountExistsWithoutPassword).toBe(false);
      expect(component.accountOauthProviders).toEqual([]);
      expect(component.fetchStatus).toBe('fetched');

    }));
    it('should handle the case where the account exists with a password ', fakeAsync(() => {
      fetchSpy.and.callFake(() => Promise.resolve(['twitter.com', 'password']));
      fc.setErrors(null);
      fc.setValue('foo@bar.com');
      expect(fc.invalid).toBe(false);
      component.fetchAccountByEmail();
      expect(fetchSpy).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(component.accountExists).toBe(true);
      expect(component.accountExistsWithoutPassword).toBe(false);
      expect(component.accountOauthProviders).toEqual([]);
      expect(component.fetchStatus).toBe('fetched');

    }));
    it('should handle the case where the account exists without a password ', fakeAsync(() => {
      component.service.providerIds = ['twitter.com'];
      fetchSpy.and.callFake(() => Promise.resolve(['twitter.com']));
      fc.setErrors(null);
      fc.setValue('foo@bar.com');
      expect(fc.invalid).toBe(false);
      component.fetchAccountByEmail();
      expect(fetchSpy).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(component.accountExists).toBe(true);
      expect(component.accountExistsWithoutPassword).toBe(true);
      expect(component.accountOauthProviders).toEqual(['twitter.com']);
      expect(component.fetchStatus).toBe('fetched');

    }));
    it('should handle an api call err ', fakeAsync(() => {
      fetchSpy.and.callFake(() => Promise.reject({code: 'auth/other'}));
      fc.setErrors(null);
      fc.setValue('foo@bar.com');
      expect(fc.invalid).toBe(false);
      component.fetchAccountByEmail();
      expect(fetchSpy).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(component.accountExists).toBe(false);
      expect(component.accountExistsWithoutPassword).toBe(false);
      expect(component.accountOauthProviders).toEqual([]);
      expect(component.fetchStatus).toBe('unfetched');
    }));
  });

  describe('submit()', () => {
    let navSpy;
    let createSpy;
    let signInSpy;
    let sendSpy;
    let updateSpy;
    let providerSpy;
    beforeEach(() => {
      const user = Object.assign({}, HELPER.MOCK_USER);
      providerSpy = spyOn(component.service, 'getProviderById').and.callFake(() => Promise.resolve({}));
      navSpy = spyOn(component.service, 'navigate').and.callThrough();
      createSpy = spyOn(component.service.auth, 'createUserWithEmailAndPassword').and.callThrough();
      signInSpy = spyOn(component.service.auth, 'signInWithEmailAndPassword').and.callFake(() => Promise.resolve(user));
      sendSpy = spyOn(user, 'sendEmailVerification').and.callThrough();
      updateSpy = spyOn(user, 'updateProfile').and.callThrough();
      component.fg = component.fb.group({
        email: [HELPER.MOCK_USER.email],
        password: ['password']
      });
      component.signUpFg = component.fb.group({
        name: ['Foo Bar'],
        tos: [true]
      });
    });
    it('should handle the auth/invalid-email error', fakeAsync(() => {
      component.accountExists = false;
      createSpy.and.callFake(() => Promise.reject({code: 'auth/invalid-email'}));
      component.submit();
      tick();
      expect(component.fg.get('email').hasError('auth/invalid-email')).toBe(true);
    }));
    it('should handle the auth/user-disabled error', fakeAsync(() => {
      component.accountExists = true;
      signInSpy.and.callFake(() => Promise.reject({code: 'auth/user-disabled'}));
      component.submit();
      tick();
      expect(component.fg.get('email').hasError('auth/user-disabled')).toBe(true);
    }));
    it('should handle the auth/weak-password error', fakeAsync(() => {
      component.accountExists = false;
      createSpy.and.callFake(() => Promise.reject({code: 'auth/weak-password'}));
      component.submit();
      tick();
      expect(component.fg.get('password').hasError('auth/weak-password')).toBe(true);
    }));
    it('should handle the auth/wrong-password error', fakeAsync(() => {
      component.accountExists = true;
      signInSpy.and.callFake(() => Promise.reject({code: 'auth/wrong-password'}));
      component.submit();
      tick();
      expect(component.fg.get('password').hasError('auth/wrong-password')).toBe(true);
    }));
    it('should handle other errors', fakeAsync(() => {
      component.accountExists = true;
      signInSpy.and.callFake(() => Promise.reject({code: 'auth/other'}));
      component.submit();
      tick();
      expect(component.unhandledError).toEqual({code: 'auth/other'});
    }));
    it('should call createUserWithEmailAndPassword if the account does not exist', fakeAsync(() => {
      component.accountExists = false;
      component.submit();
      tick();
      expect(createSpy).toHaveBeenCalledWith('foo@bar.com', 'password');
    }));
    it('should call signInWithEmailAndPassword if the account does not exist', fakeAsync(() => {
      component.accountExists = false;
      component.submit();
      tick();
      expect(signInSpy).toHaveBeenCalledWith('foo@bar.com', 'password');
    }));
    it('should call updateProfile if the account does not exist and requireDisplayName', fakeAsync(() => {
      component.accountExists = false;
      component.service.requireDisplayName = true;
      component.submit();
      tick();
      expect(updateSpy).toHaveBeenCalledWith({displayName: 'Foo Bar', photoURL: null});
    }));
    it('should not call updateProfile if the account does not exist and requireDisplayName is false', fakeAsync(() => {
      component.accountExists = false;
      component.service.requireDisplayName = false;
      component.submit();
      tick();
      expect(updateSpy).not.toHaveBeenCalled();
    }));
    it('should not call updateProfile if the account exists', fakeAsync(() => {
      component.accountExists = true;
      component.submit();
      tick();
      expect(updateSpy).not.toHaveBeenCalled();
    }));
    it('should call sendEmailVerification if the account does not exist and sendEmailVerificationLink', fakeAsync(() => {
      component.accountExists = false;
      component.service.sendEmailVerificationLink = true;
      component.submit();
      tick();
      expect(sendSpy).toHaveBeenCalledWith();
    }));
    it('should not call sendEmailVerification if account does not exist and sendEmailVerificationLink is false', fakeAsync(() => {
      component.accountExists = false;
      component.service.sendEmailVerificationLink = false;
      component.submit();
      tick();
      expect(sendSpy).not.toHaveBeenCalled();
    }));
    it('should not call sendEmailVerification if account exists', fakeAsync(() => {
      component.accountExists = true;
      component.submit();
      tick();
      expect(sendSpy).not.toHaveBeenCalled();
    }));
    it('should not navigate if the redirect is cancelled', fakeAsync(() => {
      component.service.signedInEvents.subscribe((event) => event.redirectCancelled = true);
      component.accountExists = true;
      component.submit();
      tick();
      expect(navSpy).not.toHaveBeenCalled();
    }));
    it('should navigate if the redirect is not cancelled', fakeAsync(() => {
      component.service.signedInEvents.subscribe((event) => event.redirectCancelled = false);
      component.accountExists = true;
      component.submit();
      tick();
      expect(navSpy).toHaveBeenCalledWith(null, {queryParams: {message: Messages.signedIn}});
    }));
  });
});
