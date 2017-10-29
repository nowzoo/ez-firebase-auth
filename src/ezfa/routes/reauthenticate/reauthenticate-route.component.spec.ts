import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FormBuilder, FormControl} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';

import * as TEST_HELPERS from '../../test';

import { EzfaOauthMethod } from '../../ezfa-oauth-method.enum';
import { EzfaService } from '../../ezfa.service';

import { ReauthenticateRouteComponent } from './reauthenticate-route.component';

describe('ReauthenticateRouteComponent angular sanity check', () => {
  let component: ReauthenticateRouteComponent;
  let fixture: ComponentFixture<ReauthenticateRouteComponent>;
  let authState$: BehaviorSubject<any>;
  let formBuilder: FormBuilder;
  let route;
  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    formBuilder = new FormBuilder();
    route = TEST_HELPERS.getMockActivatedRoute();
    TestBed.configureTestingModule({
      imports: [...TEST_HELPERS.MOCK_IMPORTS],
      providers: [
        {provide: FormBuilder, useValue: formBuilder},
        {provide: EzfaService, useValue: TEST_HELPERS.getMockService(authState$)},
        {provide: ActivatedRoute, useValue: route}
      ],
      declarations: [
        ReauthenticateRouteComponent,
        ...TEST_HELPERS.MOCK_UTILITIES_DECLARATIONS
      ],
    })
    .compileComponents();
    fixture = TestBed.createComponent(ReauthenticateRouteComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('onReauthSuccess', () => {
    beforeEach(() => {
      spyOn(component.service, 'navigate').and.callThrough();
    });
    it('should call navigate', () => {
      component.redirect = 'foo';
      component.onReauthSuccess();
      expect(component.service.navigate).toHaveBeenCalledWith('foo', {queryParams: {reauthenticated: 'true'}});
    });
  });




  describe('checkForRedirect()', () => {
    let result;
    let getSpy;
    beforeEach(() => {
      result = undefined;
      getSpy = spyOn(component.service.auth, 'getRedirectResult').and.callThrough();
      spyOn(component, 'onReauthSuccess').and.callThrough();
    });
    it('should resolve with true if there is a redirect', fakeAsync(() => {
      getSpy.and.callFake(() => Promise.resolve({user: TEST_HELPERS.MOCK_USER, credential: TEST_HELPERS.MOCK_USER_CRED}));
      component.checkForRedirect().then(b => result = b);
      tick();
      expect(component.onReauthSuccess).toHaveBeenCalledWith();
      expect(result).toBe(true);
    }));
    it('should resolve with false if there is no redirect', fakeAsync(() => {
      getSpy.and.callFake(() => Promise.resolve({user: null}));
      component.checkForRedirect().then(b => result = b);
      tick();
      expect(component.onReauthSuccess).not.toHaveBeenCalled();
      expect(result).toBe(false);
    }));
    it('should resolve with true if there is a redirect error', fakeAsync(() => {
      getSpy.and.callFake(() => Promise.reject({code: 'auth/error'}));
      component.checkForRedirect().then(b => result = b);
      tick();
      expect(component.onReauthSuccess).not.toHaveBeenCalled();
      expect(result).toBe(true);
      expect(component.unhandledOAuthError).toEqual({code: 'auth/error'});
    }));
  });

  describe('oAuthReauth(providerId)', () => {
    let user;
    let provider;
    let popupSpy;
    let redirectSpy;
    let getProviderByIdSpy;
    beforeEach(() => {
      user = Object.assign({}, TEST_HELPERS.MOCK_USER);
      provider = {provider: 'twitter.com'};
      popupSpy = spyOn(user, 'reauthenticateWithPopup').and.callFake(() => Promise.resolve(TEST_HELPERS.MOCK_USER_CRED));
      redirectSpy = spyOn(user, 'reauthenticateWithRedirect').and.callFake(() => Promise.resolve());
      getProviderByIdSpy = spyOn(component.service, 'getProviderById').and.callFake(() => Promise.resolve(provider));
      spyOn(component, 'onReauthSuccess').and.callThrough();
    });
    it('should navigate if there is no user', () => {
      spyOn(component.service, 'navigate').and.callThrough();
      component.user = null;
      component.oauthReauth('twitter.com');
      expect(component.service.navigate).toHaveBeenCalledWith();
    });
    it('should work if the method is popup', fakeAsync(() => {
      component.user = user;
      component.service.oauthMethod = EzfaOauthMethod.popup;
      component.oauthReauth('twitter.com');
      tick();
      expect(component.service.getProviderById).toHaveBeenCalledWith('twitter.com');
      expect(user.reauthenticateWithPopup).toHaveBeenCalledWith(provider);
      expect(component.onReauthSuccess).toHaveBeenCalled();
    }));
    it('should work if the method is popup and there is an error', fakeAsync(() => {
      component.user = user;
      component.service.oauthMethod = EzfaOauthMethod.popup;
      popupSpy.and.callFake(() => Promise.reject({code: 'auth/error'}));
      component.oauthReauth('twitter.com');
      tick();
      expect(component.service.getProviderById).toHaveBeenCalledWith('twitter.com');
      expect(user.reauthenticateWithPopup).toHaveBeenCalledWith(provider);
      expect(component.onReauthSuccess).not.toHaveBeenCalled();
      expect(component.unhandledOAuthError).toEqual({code: 'auth/error'});
    }));
    it('should work if the method is redirect', fakeAsync(() => {
      component.user = user;
      component.service.oauthMethod = EzfaOauthMethod.redirect;
      component.oauthReauth('twitter.com');
      tick();
      expect(component.service.getProviderById).toHaveBeenCalledWith('twitter.com');
      expect(user.reauthenticateWithRedirect).toHaveBeenCalledWith(provider);
      expect(component.onReauthSuccess).not.toHaveBeenCalled();
    }));
    it('should work if the method is redirect and there is an error', fakeAsync(() => {
      component.user = user;
      component.service.oauthMethod = EzfaOauthMethod.redirect;
      redirectSpy.and.callFake(() => Promise.reject({code: 'auth/error'}));
      component.oauthReauth('twitter.com');
      tick();
      expect(component.service.getProviderById).toHaveBeenCalledWith('twitter.com');
      expect(user.reauthenticateWithRedirect).toHaveBeenCalledWith(provider);
      expect(component.onReauthSuccess).not.toHaveBeenCalled();
      expect(component.unhandledOAuthError).toEqual({code: 'auth/error'});
    }));
  });
  describe('emailReauth', () => {
    let user;
    let cred;
    let reauthSpy;
    beforeEach(() => {
      user = Object.assign({}, TEST_HELPERS.MOCK_USER);
      cred = {foo: 7};
      component.fg = formBuilder.group({password: ['foobar']});
      spyOn(firebase.auth.EmailAuthProvider, 'credential').and.returnValue(cred);
      reauthSpy = spyOn(user, 'reauthenticateWithCredential').and.callFake(() => Promise.resolve());
      spyOn(component, 'onReauthSuccess').and.callThrough();
    });
    it('should navigate if there is no user', () => {
      spyOn(component.service, 'navigate').and.callThrough();
      component.user = null;
      component.emailReauth();
      expect(component.service.navigate).toHaveBeenCalledWith();
    });
    it('should work if the api call succeeds', fakeAsync(() => {
      component.user = user;
      component.emailReauth();
      expect(component.submitting).toBe(true);
      tick();
      expect(firebase.auth.EmailAuthProvider.credential).toHaveBeenCalledWith(user.email, component.fg.get('password').value);
      expect(reauthSpy).toHaveBeenCalledWith(cred);
      expect(component.onReauthSuccess).toHaveBeenCalled();
      expect(component.submitting).toBe(false);
    }));
    it('should handle auth/wrong-password error', fakeAsync(() => {
      component.user = user;
      reauthSpy.and.callFake(() => Promise.reject({code: 'auth/wrong-password'}));
      component.emailReauth();
      expect(component.submitting).toBe(true);
      expect(component.unhandledEmailError).toBe(null);
      tick();
      expect(firebase.auth.EmailAuthProvider.credential).toHaveBeenCalledWith(user.email, component.fg.get('password').value);
      expect(reauthSpy).toHaveBeenCalledWith(cred);
      expect(component.fg.get('password').hasError('auth/wrong-password')).toBe(true);
      expect(component.unhandledEmailError).toBe(null);
      expect(component.submitting).toBe(false);
    }));
    it('should handle auth/other error', fakeAsync(() => {
      component.user = user;
      reauthSpy.and.callFake(() => Promise.reject({code: 'auth/other'}));
      component.emailReauth();
      expect(component.submitting).toBe(true);
      expect(component.unhandledEmailError).toBe(null);
      tick();
      expect(firebase.auth.EmailAuthProvider.credential).toHaveBeenCalledWith(user.email, component.fg.get('password').value);
      expect(reauthSpy).toHaveBeenCalledWith(cred);
      expect(component.fg.get('password').hasError('auth/wrong-password')).toBe(false);
      expect(component.unhandledEmailError).toEqual({code: 'auth/other'});
      expect(component.submitting).toBe(false);
    }));
  });

  describe('ngOnInit()', () => {
    let user;
    beforeEach(() => {
      user = Object.assign({}, TEST_HELPERS.MOCK_USER);
      authState$.next(user);
    });
    it('should call service.onRouteChange', () => {
      spyOn(component.service, 'onRouteChange').and.callThrough();
      component.ngOnInit();
      expect(component.service.onRouteChange).toHaveBeenCalledWith('reauthenticate');
    });
    it('should gate to signed in user', fakeAsync(() => {
      spyOn(component, 'gateToSignedInUser').and.callFake(() => {});
      component.ngOnInit();
      tick();
      expect(component.gateToSignedInUser).toHaveBeenCalledWith();
    }));
    it('should initialize redirect from the route', () => {
      component.route.snapshot.queryParams.redirect = 'foo';
      component.ngOnInit();
      expect(component.redirect).toBe('foo');
    });
    it('should set up the id', () => {
      component.ngOnInit();
      expect(component.id).toBeTruthy();
    });
    it('should set up the form', () => {
      component.ngOnInit();
      expect(component.fg).toBeTruthy();
      expect(component.fg.get('email')).toBeTruthy();
      expect(component.fg.get('password')).toBeTruthy();
    });
    it('should set the value of the email control to the user\'s email if there is a user', () => {
      component.ngOnInit();
      expect(component.fg.get('email').value).toBe(user.email);
    });
    it('should set the value of the email control to empty there is no user', () => {
      component.ngOnInit();
      authState$.next(null);
      expect(component.fg.get('email').value).toBe('');
    });
    it('should disable the email control', () => {
      component.ngOnInit();
      expect(component.fg.get('email').disabled).toBe(true);
    });
    it('should remove the auth/wrong-password error when the password control changes', () => {
      component.ngOnInit();
      const fc = component.fg.get('password');
      fc.setValue('s,jhjshghsg');
      fc.setErrors({'auth/wrong-password': true});
      expect(fc.hasError('auth/wrong-password')).toBe(true);
      fc.setValue('s,issoiius');
      expect(fc.hasError('auth/wrong-password')).toBe(false);
    });
  });

});
