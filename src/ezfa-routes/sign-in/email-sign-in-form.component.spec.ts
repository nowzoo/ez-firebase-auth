import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FormBuilder } from '@angular/forms';

import { SfaMessages } from '../messages.enum';
import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET
 } from '../../test';

import { EmailSignInFormComponent } from './email-sign-in-form.component';

describe('EmailSignInFormComponent angular sanity check', () => {
  let component: EmailSignInFormComponent;
  let fixture: ComponentFixture<EmailSignInFormComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...MOCK_IMPORTS],
      declarations: [
        EmailSignInFormComponent,
        ...MOCK_UTILITIES_DECLARATIONS
      ],
      providers: [
        ...MOCK_PROVIDERS
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(EmailSignInFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

describe('EmailSignInFormComponent', () => {
  let component;
  let authState$: BehaviorSubject<any>;
  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    const sfaService: any = Object.assign({}, MOCK_AUTH_SERVICE_GET(), {
      authState: authState$.asObservable(),
      configuredProviderIds: ['password', 'twitter.com', 'facebook.com', 'google.com', 'github.com'],
      oAuthProviderIds: ['twitter.com', 'facebook.com', 'google.com', 'github.com']
    });
    const oauthService: any = MOCK_OAUTH_SERVICE_GET();
    const fb = new FormBuilder();
    component = new EmailSignInFormComponent( fb, sfaService);
  });

  describe('ngOnInit', () => {
    it('should set an id', () => {
      component.ngOnInit();
      expect(component.id).toBeTruthy();
    })
    it('should set up the fg with email and password controls', () => {
      component.ngOnInit();
      expect(component.fg.get('email')).toBeTruthy();
      expect(component.fg.get('password')).toBeTruthy();
    })
    it('should set up the signUpFg', () => {
      component.ngOnInit();
      expect(component.signUpFg).toBeTruthy();
    })
    it('should set up the signUpFg with name if requireDisplayName', () => {
      component.authService.requireDisplayName = true;
      component.ngOnInit();
      expect(component.signUpFg.get('name')).toBeTruthy();
    })
    it('should not set up the signUpFg with name if ! requireDisplayName', () => {
      component.authService.requireDisplayName = false;
      component.ngOnInit();
      expect(component.signUpFg.get('name')).not.toBeTruthy();
    })
    it('should set up the signUpFg with tos if requireTos', () => {
      component.authService.requireTos = true;
      component.ngOnInit();
      expect(component.signUpFg.get('tos')).toBeTruthy();
    })
    it('should not set up the signUpFg with tos if ! requireTos', () => {
      component.authService.requireTos = false;
      component.ngOnInit();
      expect(component.signUpFg.get('tos')).not.toBeTruthy();
    })
    it('should watch the email control for value changes, and call fetchAccountByEmail', fakeAsync(() => {
      component.ngOnInit();
      spyOn(component, 'fetchAccountByEmail').and.callThrough();
      component.fg.get('email').setValue('sfhgfsh@sgfsgf.com');
      tick(250);
      expect(component.fetchAccountByEmail).toHaveBeenCalled();
    }))
    it('should watch the email control for status changes, and call fetchAccountByEmail', fakeAsync(() => {
      component.ngOnInit();
      spyOn(component, 'fetchAccountByEmail').and.callThrough();
      component.fg.get('email').setErrors(null);
      component.fg.get('email').updateValueAndValidity();
      tick(250);
      expect(component.fetchAccountByEmail).toHaveBeenCalled();
    }))

    it('should clear the weak password error when the input changes', fakeAsync(() => {
      component.ngOnInit();
      tick();
      const fc = component.fg.get('password');
      expect(fc.hasError('auth/weak-password')).toBe(false);
      fc.setValue('123');
      fc.setErrors({'auth/weak-password': true});
      expect(fc.hasError('auth/weak-password')).toBe(true);
      fc.setValue('123 a strong password');
      tick();
      expect(fc.hasError('auth/weak-password')).toBe(false);
    }))

    it('should clear the wrong password error when the input changes', fakeAsync(() => {
      component.ngOnInit();
      tick();
      const fc = component.fg.get('password');
      expect(fc.hasError('auth/wrong-password')).toBe(false);
      fc.setValue('123');
      fc.setErrors({'auth/wrong-password': true});
      expect(fc.hasError('auth/wrong-password')).toBe(true);
      fc.setValue('123 a strong password');
      tick();
      expect(fc.hasError('auth/wrong-password')).toBe(false);
    }))
  })
  describe('fetchAccountByEmail', () => {
    let fetchSpy;
    let fc;
    beforeEach(() => {
      component.fg = component.fb.group({email: ['']});
      fc = component.fg.get('email');
      component.accountExists = false;
      component.accountExistsWithoutPassword = false;
      component.accountOAuthProviders = []
      fetchSpy = spyOn(component.authService.auth, 'fetchProvidersForEmail').and.callThrough();
    });
    it('should reset everything and not fetch if the email control is invalid ', fakeAsync(() => {
      component.accountExists = true;
      component.accountExistsWithoutPassword = true;
      component.accountOAuthProviders = ['twitter.com']
      fc.setErrors({invalid: true});
      expect(fc.invalid).toBe(true);
      component.fetchAccountByEmail();
      expect(component.accountExists).toBe(false);
      expect(component.accountExistsWithoutPassword).toBe(false);
      expect(component.accountOAuthProviders).toEqual([]);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(component.fetchStatus).toBe('unfetched')

    }))
    it('should fetch if the control is valid ', fakeAsync(() => {
      fc.setErrors(null);
      fc.setValue('foo@bar.com');
      expect(fc.invalid).toBe(false);
      component.fetchAccountByEmail();
      expect(fetchSpy).toHaveBeenCalledWith('foo@bar.com');
    }))
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
      expect(component.accountOAuthProviders).toEqual([]);
      expect(component.fetchStatus).toBe('fetched')

    }))
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
      expect(component.accountOAuthProviders).toEqual([]);
      expect(component.fetchStatus).toBe('fetched')

    }))
    it('should handle the case where the account exists without a password ', fakeAsync(() => {
      fetchSpy.and.callFake(() => Promise.resolve(['twitter.com']));
      fc.setErrors(null);
      fc.setValue('foo@bar.com');
      expect(fc.invalid).toBe(false);
      component.fetchAccountByEmail();
      expect(fetchSpy).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(component.accountExists).toBe(true);
      expect(component.accountExistsWithoutPassword).toBe(true);
      expect(component.accountOAuthProviders).toEqual(['twitter.com']);
      expect(component.fetchStatus).toBe('fetched')

    }))
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
      expect(component.accountOAuthProviders).toEqual([]);
      expect(component.fetchStatus).toBe('unfetched')
    }))
  })

  describe('submit()', () => {
    let navSpy;
    let createSpy;
    let signInSpy;
    let sendSpy;
    let updateSpy;
    let providerSpy;
    beforeEach(() => {
      const user = Object.assign({}, MOCK_USER);
      providerSpy = spyOn(component.authService, 'getProviderById').and.callFake(() => Promise.resolve({}));
      navSpy = spyOn(component.authService, 'navigate').and.callThrough();
      createSpy = spyOn(component.authService.auth, 'createUserWithEmailAndPassword').and.callThrough();
      signInSpy = spyOn(component.authService.auth, 'signInWithEmailAndPassword').and.callFake(() => Promise.resolve(user));
      sendSpy = spyOn(user, 'sendEmailVerification').and.callThrough();
      updateSpy = spyOn(user, 'updateProfile').and.callThrough();
      component.fg = component.fb.group({
        email: [MOCK_USER.email],
        password: ['password']
      })
      component.signUpFg = component.fb.group({
        name: ['Foo Bar'],
        tos: [true]
      })
    })
    it('should handle the auth/invalid-email error', fakeAsync(() => {
      component.accountExists = false;
      createSpy.and.callFake(() => Promise.reject({code: 'auth/invalid-email'}));
      component.submit();
      tick();
      expect(component.fg.get('email').hasError('auth/invalid-email')).toBe(true);
    }))
    it('should handle the auth/user-disabled error', fakeAsync(() => {
      component.accountExists = false;
      createSpy.and.callFake(() => Promise.reject({code: 'auth/user-disabled'}));
      component.submit();
      tick();
      expect(component.fg.get('email').hasError('auth/user-disabled')).toBe(true);
    }))
    it('should handle the auth/weak-password error', fakeAsync(() => {
      component.accountExists = false;
      createSpy.and.callFake(() => Promise.reject({code: 'auth/weak-password'}));
      component.submit();
      tick();
      expect(component.fg.get('password').hasError('auth/weak-password')).toBe(true);
    }))
    it('should handle the auth/wrong-password error', fakeAsync(() => {
      component.accountExists = true;
      signInSpy.and.callFake(() => Promise.reject({code: 'auth/wrong-password'}));
      component.submit();
      tick();
      expect(component.fg.get('password').hasError('auth/wrong-password')).toBe(true);
    }))
    it('should handle other errors', fakeAsync(() => {
      component.accountExists = true;
      signInSpy.and.callFake(() => Promise.reject({code: 'auth/other'}));
      component.submit();
      tick();
      expect(component.unhandledError).toEqual({code: 'auth/other'})
    }))
    it('should call createUserWithEmailAndPassword if the account does not exist', fakeAsync(() => {
      component.accountExists = false;
      component.submit();
      tick();

      expect(createSpy).toHaveBeenCalledWith('foo@bar.com', 'password')
    }))
    it('should call signInWithEmailAndPassword if the account does not exist', fakeAsync(() => {
      component.accountExists = false;
      component.submit();
      tick();
      expect(signInSpy).toHaveBeenCalledWith('foo@bar.com', 'password')
    }))
    it('should call updateProfile if the account does not exist and requireDisplayName', fakeAsync(() => {
      component.accountExists = false;
      component.authService.requireDisplayName = true;
      component.submit();
      tick();
      expect(updateSpy).toHaveBeenCalledWith({displayName: 'Foo Bar', photoURL: null})
    }))
    it('should not call updateProfile if the account does not exist and requireDisplayName is false', fakeAsync(() => {
      component.accountExists = false;
      component.authService.requireDisplayName = false;
      component.submit();
      tick();
      expect(updateSpy).not.toHaveBeenCalled();
    }))
    it('should not call updateProfile if the account exists', fakeAsync(() => {
      component.accountExists = true;
      component.submit();
      tick();
      expect(updateSpy).not.toHaveBeenCalled();
    }))
    it('should call sendEmailVerification if the account does not exist and sendEmailVerificationLink', fakeAsync(() => {
      component.accountExists = false;
      component.authService.sendEmailVerificationLink = true;
      component.submit();
      tick();
      expect(sendSpy).toHaveBeenCalledWith()
    }))
    it('should not call sendEmailVerification if account does not exist and sendEmailVerificationLink is false', fakeAsync(() => {
      component.accountExists = false;
      component.authService.sendEmailVerificationLink = false;
      component.submit();
      tick();
      expect(sendSpy).not.toHaveBeenCalled()
    }))
    it('should not call sendEmailVerification if account exists', fakeAsync(() => {
      component.accountExists = true;
      component.submit();
      tick();
      expect(sendSpy).not.toHaveBeenCalled()
    }))
    it('should not navigate id the redirect is cancelled', fakeAsync(() => {
      component.authService.signedIn.subscribe(() => component.authService.authRedirectCancelled = true);
      component.accountExists = true;
      component.submit();
      tick();
      expect(navSpy).not.toHaveBeenCalled()
    }))
    it('should navigate if the redirect is not cancelled', fakeAsync(() => {
      component.authService.signedIn.subscribe(() => component.authService.authRedirectCancelled = false);
      component.accountExists = true;
      component.submit();
      tick();
      expect(navSpy).toHaveBeenCalledWith(null, {queryParams: {message: SfaMessages.signedIn}})
    }))
  })

})
