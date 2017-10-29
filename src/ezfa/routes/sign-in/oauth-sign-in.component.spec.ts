import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';



import { OauthSignInComponent } from './oauth-sign-in.component';
import { EzfaService } from '../../ezfa.service';
import { EzfaSignedInEvent } from '../../ezfa-signed-in-event.class';
import { EzfaOauthMethod } from '../../ezfa-oauth-method.enum';
import { Messages } from '../messages.enum';

import * as TEST_HELPERS from '../../test';


describe('OauthSignInComponent angular sanity check', () => {
  let component: OauthSignInComponent;
  let fixture: ComponentFixture<OauthSignInComponent>;
  let authState$: BehaviorSubject<any>;
  let service;
  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    service = Object.assign({}, TEST_HELPERS.getMockService(authState$), {providerIds: EzfaService.ENABLED_PROVIDERS});
    TestBed.configureTestingModule({
      declarations: [
        OauthSignInComponent,
        ...TEST_HELPERS.MOCK_UTILITIES_DECLARATIONS
      ],
      providers: [
        {provide: EzfaService, useValue: service},
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(OauthSignInComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should correctly init providers', () => {
      component.ngOnInit();
      expect(component.providerIds).not.toContain('password');
      expect(component.providerIds).toContain('twitter.com');
    });
    it('should check for a redirect', () => {
      spyOn(component, 'checkForRedirect').and.callFake(() => Promise.resolve(false));
      component.ngOnInit();
      expect(component.checkForRedirect).toHaveBeenCalledWith();
    });
  });

  describe('onError', () => {
    beforeEach(() => {
      spyOn(component.service.auth, 'fetchProvidersForEmail').and.callFake(() => Promise.resolve(['twitter.com']));
    });
    it('should deal with the auth/account-exists-with-different-credential error', fakeAsync(() => {
      component.onError({
        code: 'auth/account-exists-with-different-credential',
        email: 'foo@bar.com'
      });
      tick();
      expect(component.service.auth.fetchProvidersForEmail).toHaveBeenCalledWith('foo@bar.com');
      expect(component.error).toEqual({
        code: 'auth/account-exists-with-different-credential',
        email: 'foo@bar.com'
      });
      expect(component.userProviderIds).toEqual(['twitter.com']);
    }));
    it('should deal with other errors', fakeAsync(() => {
      component.onError({
        code: 'auth/other',
      });
      tick();
      expect(component.error).toEqual({
        code: 'auth/other'
      });
      expect(component.userProviderIds).toEqual([]);
    }));
  });

  describe('onSuccess', () => {
    let cred;
    beforeEach(() => {
      cred = TEST_HELPERS.MOCK_USER_CRED;
      spyOn(component.service, 'onSignedIn').and.callThrough();
      spyOn(component.service, 'navigate').and.callThrough();
    });
    it('should call onSignedIn', () => {
      component.onSuccess(cred);
      expect(component.service.onSignedIn).toHaveBeenCalled();
    });
    it('should call navigate if the event is not cancelled', () => {
      component.service.signedInEvents.subscribe(e => {
        e.redirectCancelled = false;
      });
      component.onSuccess(cred);
      expect(component.service.navigate).toHaveBeenCalledWith('account', {queryParams: {message: Messages.signedIn}});
    });
    it('should not call navigate if the event is cancelled', () => {
      component.service.signedInEvents.subscribe(e => {
        e.redirectCancelled = true;
      });
      component.onSuccess(cred);
      expect(component.service.navigate).not.toHaveBeenCalled();
    });
  });
  describe('signIn', () => {
    let provider;
    let cred;
    let popupSpy;
    let redirectSpy;
    beforeEach(() => {
      provider = {providerId: 'twitter.com'};
      cred = TEST_HELPERS.MOCK_USER_CRED;
      spyOn(component.service, 'getProviderById').and.callFake(() => Promise.resolve(provider));
      popupSpy = spyOn(component.service.auth, 'signInWithPopup').and.callFake(() => Promise.resolve(cred));
      redirectSpy = spyOn(component.service.auth, 'signInWithRedirect').and.callFake(() => Promise.resolve());
      spyOn(component, 'onSuccess').and.callFake(() => {});
      spyOn(component, 'onError').and.callThrough();
    });
    it('should get the provider', () => {
      component.signIn('twitter.com');
      expect(component.service.getProviderById).toHaveBeenCalledWith('twitter.com');
    });
    it('should handle if the auth method is redirect', fakeAsync(() => {
      component.service.oauthMethod = EzfaOauthMethod.redirect;
      component.signIn('twitter.com');
      tick();
      expect(redirectSpy).toHaveBeenCalledWith(provider);
    }));
    it('should handle an error if the auth method is redirect', fakeAsync(() => {
      component.service.oauthMethod = EzfaOauthMethod.redirect;
      redirectSpy.and.callFake(() => Promise.reject({code: 'auth/error'}));
      component.signIn('twitter.com');
      tick();
      expect(redirectSpy).toHaveBeenCalledWith(provider);
      expect(component.error).toEqual({code: 'auth/error'});
    }));
    it('should handle if the auth method is popup', fakeAsync(() => {
      component.service.oauthMethod = EzfaOauthMethod.popup;
      component.signIn('twitter.com');
      tick();
      expect(popupSpy).toHaveBeenCalledWith(provider);
    }));
    it('should handle success if the auth method is popup', fakeAsync(() => {
      component.service.oauthMethod = EzfaOauthMethod.popup;
      component.signIn('twitter.com');
      tick();
      expect(popupSpy).toHaveBeenCalledWith(provider);
      expect(component.onSuccess).toHaveBeenCalledWith(cred);
    }));
    it('should handle error if the auth method is popup', fakeAsync(() => {
      popupSpy.and.callFake(() => Promise.reject({code: 'auth/error'}));
      component.service.oauthMethod = EzfaOauthMethod.popup;
      component.signIn('twitter.com');
      tick();
      expect(popupSpy).toHaveBeenCalledWith(provider);
      expect(component.onError).toHaveBeenCalledWith({code: 'auth/error'});
    }));
  });

  describe('checkForRedirect', () => {
    let cred;
    let getSpy;
    beforeEach(() => {
      cred = TEST_HELPERS.MOCK_USER_CRED;
      getSpy = spyOn(component.service.auth, 'getRedirectResult').and.callFake(() => Promise.resolve(cred));
      spyOn(component, 'onError').and.callThrough();
      spyOn(component, 'onSuccess').and.callThrough();
    });
    it('should call auth.getRedirectResult', fakeAsync(() => {
      component.checkForRedirect();
      tick();
      expect(getSpy).toHaveBeenCalledWith();
    }));
    it('should deal with success', fakeAsync(() => {
      getSpy.and.callFake(() => Promise.resolve(cred));
      component.checkForRedirect();
      tick();
      expect(getSpy).toHaveBeenCalledWith();
      expect(component.onSuccess).toHaveBeenCalledWith(cred);
    }));
    it('should deal with the situation where there is no redirect', fakeAsync(() => {
      getSpy.and.callFake(() => Promise.resolve({user: null}));
      component.checkForRedirect();
      tick();
      expect(getSpy).toHaveBeenCalledWith();
      expect(component.onSuccess).not.toHaveBeenCalled();
    }));
    it('should deal with the situation where there is an error', fakeAsync(() => {
      getSpy.and.callFake(() => Promise.reject({code: 'auth/error'}));
      component.checkForRedirect();
      tick();
      expect(getSpy).toHaveBeenCalledWith();
      expect(component.onSuccess).not.toHaveBeenCalled();
      expect(component.onError).toHaveBeenCalledWith({code: 'auth/error'});
    }));

  });
});
