import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FormBuilder, FormControl} from '@angular/forms'
import * as firebase from 'firebase';
import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET
 } from '../../test';
 import { IAuthUserEvent } from '../../sfa/sfa';
 import { OAuthMethod } from '../../sfa/sfa';

import { ReauthenticateRouteComponent } from './reauthenticate-route.component';

describe('ReauthenticateRouteComponent angular sanity check', () => {
  let component: ReauthenticateRouteComponent;
  let fixture: ComponentFixture<ReauthenticateRouteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...MOCK_IMPORTS],
      providers: [...MOCK_PROVIDERS],
      declarations: [ReauthenticateRouteComponent,  ...MOCK_UTILITIES_DECLARATIONS],
    })
    .compileComponents();
    fixture = TestBed.createComponent(ReauthenticateRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
describe('ReauthenticateRouteComponent', () => {
  let component;
  let authState$: BehaviorSubject<any>;

  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    const sfaService: any = Object.assign({}, MOCK_AUTH_SERVICE_GET(), {
      authState: authState$.asObservable(),
      configuredProviderIds: ['password', 'twitter.com', 'facebook.com', 'google.com', 'github.com'],
      oAuthProviderIds: ['twitter.com', 'facebook.com', 'google.com', 'github.com']
    });
    const route: any = Object.assign({}, MOCK_ROUTE_GET());
    const oAuthService: any = Object.assign({}, MOCK_OAUTH_SERVICE_GET());
    const fb = new FormBuilder();
    component = new ReauthenticateRouteComponent(route, fb, oAuthService, sfaService);
  });

  describe('ngOnInit', () => {
    it('should set up the form', () => {
      component.ngOnInit();
      expect(component.fg).toBeTruthy();
      expect(component.fg.get('password')).toBeTruthy();
      expect(component.id).toBeTruthy();
    })
    it('should clear the wrong password err', fakeAsync(() => {
      authState$.next(MOCK_USER);
      component.ngOnInit();
      const fc = component.fg.get('password');
      fc.setValue('foo');
      fc.setErrors({'auth/wrong-password': true})
      expect(fc.hasError('auth/wrong-password')).toBe(true);
      fc.setValue('foob');
      tick();
      expect(fc.hasError('auth/wrong-password')).toBe(false);
    }));
    it ('should set up the user, check for redirect and then gate', fakeAsync(() => {
      spyOn(component, 'onInitLoadUser').and.callThrough();
      spyOn(component, 'checkForRedirect').and.callThrough();
      spyOn(component, 'gateToSignedInUser').and.callThrough();
      authState$.next(MOCK_USER);
      component.ngOnInit();
      expect(component.onInitLoadUser).toHaveBeenCalled();
      tick();
      expect(component.checkForRedirect).toHaveBeenCalled();
      expect(component.gateToSignedInUser).toHaveBeenCalled();
    }))
  })

  describe('checkForRedirect', () => {
    it('should resolve with true if there is a successful redirect', fakeAsync(() => {
      spyOn(component.oAuthService, 'checkForReauthenticateRedirect').and.callFake(() => Promise.resolve({}));
      spyOn(component, 'onReauthSuccess').and.callThrough();
      const user = Object.assign({}, MOCK_USER);
      component.user = user;
      let resolved;
      component.checkForRedirect().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.onReauthSuccess).toHaveBeenCalled();
    }))
    it('should resolve with false if there is no redirect', fakeAsync(() => {
      spyOn(component.oAuthService, 'checkForReauthenticateRedirect').and.callFake(() => Promise.resolve(null));
      spyOn(component, 'onReauthSuccess').and.callThrough();
      const user = Object.assign({}, MOCK_USER);
      component.user = user;
      let resolved;
      component.checkForRedirect().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false);
      expect(component.onReauthSuccess).not.toHaveBeenCalled();
    }))
    it('should resolve with true if there is a redirect err', fakeAsync(() => {
      spyOn(component.oAuthService, 'checkForReauthenticateRedirect').and.callFake(() => Promise.reject({code: 'auth/other'}));
      spyOn(component, 'onReauthSuccess').and.callThrough();
      const user = Object.assign({}, MOCK_USER);
      component.user = user;
      let resolved;
      component.checkForRedirect().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.unhandledOAuthError).toEqual({code: 'auth/other'})
      expect(component.onReauthSuccess).not.toHaveBeenCalled();
    }))
  })

  describe('onReauthSuccess', () => {
    const extras = { queryParams: { reauthenticated: 'true' }};
    it('should navigate if the redirect param is missing', () => {
      spyOn(component.authService, 'navigate').and.callThrough();
      component.redirect = null;
      component.onReauthSuccess();
      expect(component.authService.navigate).toHaveBeenCalledWith(null, extras)
    })
    it('should navigate if the redirect param is present', () => {
      spyOn(component.authService, 'navigate').and.callThrough();
      component.redirect = 'add-password';
      component.onReauthSuccess();
      expect(component.authService.navigate).toHaveBeenCalledWith('add-password', extras)
    })
  })

  describe('oAuthReauth(providerId)', () => {
    it('should return if there is no user', () => {
      spyOn(component.oAuthService, 'reauthenticateWithRedirect').and.callThrough();
      spyOn(component.oAuthService, 'reauthenticateWithPopup').and.callThrough()
      authState$.next(null);
      component.ngOnInit();
      component.oAuthReauth('twitter.com');
      expect(component.oAuthService.reauthenticateWithRedirect).not.toHaveBeenCalled();
      expect(component.oAuthService.reauthenticateWithPopup).not.toHaveBeenCalled();
    })
    it('should work if the method is popup', fakeAsync(() => {
      component.authService.oAuthMethod = OAuthMethod.popup;
      spyOn(component, 'onReauthSuccess').and.callThrough();
      spyOn(component.oAuthService, 'reauthenticateWithPopup').and.callFake(() => Promise.resolve({}))
      const user = Object.assign({}, MOCK_USER);
      authState$.next(user);
      component.ngOnInit();
      component.oAuthReauth('twitter.com');
      tick();
      expect(component.oAuthService.reauthenticateWithPopup).toHaveBeenCalledWith('twitter.com', user);
      expect(component.onReauthSuccess).toHaveBeenCalled();
    }))
    it('should handle if reauthenticateWithPopup resolves with nothing', fakeAsync(() => {
      component.authService.oAuthMethod = OAuthMethod.popup;
      spyOn(component, 'onReauthSuccess').and.callThrough();
      spyOn(component.oAuthService, 'reauthenticateWithPopup').and.callFake(() => Promise.resolve(null))
      const user = Object.assign({}, MOCK_USER);
      authState$.next(user);
      component.ngOnInit();
      component.oAuthReauth('twitter.com');
      tick();
      expect(component.oAuthService.reauthenticateWithPopup).toHaveBeenCalledWith('twitter.com', user);
      expect(component.onReauthSuccess).not.toHaveBeenCalled();
    }))
    it('should handle if reauthenticateWithPopup rejects', fakeAsync(() => {
      component.authService.oAuthMethod = OAuthMethod.popup;
      spyOn(component, 'onReauthSuccess').and.callThrough();
      spyOn(component.oAuthService, 'reauthenticateWithPopup').and.callFake(() => Promise.reject({code: 'auth/other'}))
      const user = Object.assign({}, MOCK_USER);
      authState$.next(user);
      component.ngOnInit();
      component.oAuthReauth('twitter.com');
      expect(component.unhandledOAuthError).toBe(null)
      tick();
      expect(component.oAuthService.reauthenticateWithPopup).toHaveBeenCalledWith('twitter.com', user);
      expect(component.onReauthSuccess).not.toHaveBeenCalled();
      expect(component.unhandledOAuthError).toEqual({code: 'auth/other'})
    }))

    it('should work if the method is redirect', fakeAsync(() => {
      component.authService.oAuthMethod = OAuthMethod.redirect;
      spyOn(component, 'onReauthSuccess').and.callThrough();
      spyOn(component.oAuthService, 'reauthenticateWithRedirect').and.callFake(() => Promise.resolve({}))
      const user = Object.assign({}, MOCK_USER);
      authState$.next(user);
      component.ngOnInit();
      component.oAuthReauth('twitter.com');
      tick();
      expect(component.oAuthService.reauthenticateWithRedirect).toHaveBeenCalledWith('twitter.com', user);
      expect(component.onReauthSuccess).not.toHaveBeenCalled();
    }))
    it('should handle if reauthenticateWithRedirect rejects', fakeAsync(() => {
      component.authService.oAuthMethod = OAuthMethod.redirect;
      spyOn(component, 'onReauthSuccess').and.callThrough();
      spyOn(component.oAuthService, 'reauthenticateWithRedirect').and.callFake(() => Promise.reject({code: 'auth/other'}))
      const user = Object.assign({}, MOCK_USER);
      authState$.next(user);
      component.ngOnInit();
      component.oAuthReauth('twitter.com');
      expect(component.unhandledOAuthError).toBe(null)
      tick();
      expect(component.oAuthService.reauthenticateWithRedirect).toHaveBeenCalledWith('twitter.com', user);
      expect(component.onReauthSuccess).not.toHaveBeenCalled();
      expect(component.unhandledOAuthError).toEqual({code: 'auth/other'})
    }))

  })


  describe('emailReauth', () => {
    it('should return if there is no user', () => {
      authState$.next(null);
      component.ngOnInit();
      component.emailReauth();
      expect(component.submitting).toBe(false)
    })
    it('should resolve', fakeAsync(() => {
      const user = Object.assign({}, MOCK_USER)
      authState$.next(user);
      spyOn(user, 'reauthenticateWithCredential').and.callThrough();
      spyOn(component, 'onReauthSuccess').and.callThrough();
      component.ngOnInit();
      component.emailReauth();
      expect(component.submitting).toBe(true);
      expect(component.unhandledEmailError).toBe(null);
      expect(user.reauthenticateWithCredential).toHaveBeenCalledWith(jasmine.any(Object));
      tick();
      expect(component.onReauthSuccess).toHaveBeenCalledWith()
      expect(component.submitting).toBe(false);
      expect(component.unhandledEmailError).toBe(null);

    }))
    it('should handle auth/wrong-password', fakeAsync(() => {
      const user = Object.assign({}, MOCK_USER)
      authState$.next(user);
      spyOn(user, 'reauthenticateWithCredential').and.callFake(() => Promise.reject({code: 'auth/wrong-password'}))
      spyOn(component, 'onReauthSuccess').and.callThrough();
      component.ngOnInit();
      component.emailReauth();
      expect(component.submitting).toBe(true);
      expect(component.unhandledEmailError).toBe(null);
      expect(user.reauthenticateWithCredential).toHaveBeenCalledWith(jasmine.any(Object));
      tick();
      expect(component.onReauthSuccess).not.toHaveBeenCalled();
      expect(component.submitting).toBe(false);
      expect(component.fg.get('password').hasError('auth/wrong-password')).toBe(true)
      expect(component.unhandledEmailError).toBe(null);
    }))
    it('should handle other errors', fakeAsync(() => {
      const user = Object.assign({}, MOCK_USER)
      authState$.next(user);
      spyOn(user, 'reauthenticateWithCredential').and.callFake(() => Promise.reject({code: 'auth/other'}))
      spyOn(component, 'onReauthSuccess').and.callThrough();
      component.ngOnInit();
      component.emailReauth();
      expect(component.submitting).toBe(true);
      expect(component.unhandledEmailError).toBe(null);
      expect(user.reauthenticateWithCredential).toHaveBeenCalledWith(jasmine.any(Object));
      tick();
      expect(component.onReauthSuccess).not.toHaveBeenCalled();
      expect(component.submitting).toBe(false);
      expect(component.fg.get('password').hasError('auth/wrong-password')).toBe(false)
      expect(component.unhandledEmailError).toEqual({code: 'auth/other'});
    }))
  })
})
