import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';



import { OauthSignInComponent } from './oauth-sign-in.component';
import { OAuthMethod } from '../../sfa/sfa';
import { IAuthUserEvent } from '../../sfa/sfa';

import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET
 } from '../../test';


describe('OauthSignInComponent angular sanity check', () => {
  let component: OauthSignInComponent;
  let fixture: ComponentFixture<OauthSignInComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        OauthSignInComponent,
        ...MOCK_UTILITIES_DECLARATIONS
      ],
      providers: [
        ...MOCK_PROVIDERS
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(OauthSignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
describe('OauthSignInComponent', () => {
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
    component = new OauthSignInComponent(oauthService, sfaService);
  });

  describe('ngOnInit', () => {
    let checkSpy;
    let errSpy;
    beforeEach(() => {
      checkSpy = spyOn(component.oAuthService, 'checkForSignInRedirect').and.callThrough();
      errSpy = spyOn(component, 'handleOAuthError').and.callThrough();
    })
    it('should not set an error if checkForSignInRedirect does not reject with one', fakeAsync(() => {
      checkSpy.and.callFake(() => Promise.resolve());
      component.ngOnInit();
      tick();
      expect(errSpy).not.toHaveBeenCalled();
    }))
    it('should set an error if checkForSignInRedirect rejects with one', fakeAsync(() => {
      checkSpy.and.callFake(() => Promise.reject({code: 'auth/err'}));
      component.ngOnInit();
      tick();
      expect(errSpy).toHaveBeenCalledWith({code: 'auth/err'});
    }))

    it('should set oAuthProviderIds', () => {
      component.authService.oAuthProviderIds = ['twitter.com', 'github.com'];
      component.ngOnInit();
      expect(component.oAuthProviderIds).toEqual(['twitter.com', 'github.com']);
    })
  })
  describe('handleOAuthError', () => {
    it('should handle auth/account-exists-with-different-credential', () => {
      component.handleOAuthError({code: 'auth/account-exists-with-different-credential'});
      expect(component.diffCredError).toEqual({code: 'auth/account-exists-with-different-credential'});
    })
    it('should handle other errors', () => {
      component.handleOAuthError({code: 'auth/other'});
      expect(component.unhandledCredError).toEqual({code: 'auth/other'});
    })
  })

  describe('oAuthSignIn', () => {
    let popUpSpy;
    let redirectSpy;
    let errSpy;
    beforeEach(() => {
      popUpSpy = spyOn(component.oAuthService, 'signInWithPopup').and.callThrough();
      redirectSpy = spyOn(component.oAuthService, 'signInWithRedirect').and.callThrough();
      errSpy = spyOn(component, 'handleOAuthError').and.callThrough();
    })
    it ('should work for popup', fakeAsync(() => {
      component.authService.oAuthMethod = OAuthMethod.popup;
      component.oAuthSignIn('twitter.com');
      tick();
      expect(popUpSpy).toHaveBeenCalledWith('twitter.com');
      expect(errSpy).not.toHaveBeenCalled();
    }));
    it ('should work for popup with a falure', fakeAsync(() => {
      popUpSpy.and.callFake(() => Promise.reject({code: 'auth/err'}))
      component.authService.oAuthMethod = OAuthMethod.popup;
      component.oAuthSignIn('twitter.com');
      tick();
      expect(popUpSpy).toHaveBeenCalledWith('twitter.com');
      expect(errSpy).toHaveBeenCalledWith({code: 'auth/err'});
    }));

    it ('should work for redirect', fakeAsync(() => {
      component.authService.oAuthMethod = OAuthMethod.redirect;
      component.oAuthSignIn('twitter.com');
      tick();
      expect(redirectSpy).toHaveBeenCalledWith('twitter.com');
      expect(errSpy).not.toHaveBeenCalled();
    }));
    it ('should work for redirect with a failure', fakeAsync(() => {
      redirectSpy.and.callFake(() => Promise.reject({code: 'auth/err'}))
      component.authService.oAuthMethod = OAuthMethod.redirect;
      component.oAuthSignIn('twitter.com');
      tick();
      expect(redirectSpy).toHaveBeenCalledWith('twitter.com');
      expect(errSpy).toHaveBeenCalledWith({code: 'auth/err'});
    }));
  })
})
