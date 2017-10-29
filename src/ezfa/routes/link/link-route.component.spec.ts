import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as firebase from 'firebase';
import * as HELPER from '../../test';

import { EzfaService } from '../../ezfa.service';
import { EzfaProviderLinkedEvent } from '../../ezfa-provider-linked-event.class';
import { EzfaOauthMethod } from '../../ezfa-oauth-method.enum';
import { LinkRouteComponent } from './link-route.component';
import { Messages } from '../messages.enum';

describe('LinkRouteComponent', () => {
  let component: LinkRouteComponent;
  let fixture: ComponentFixture<LinkRouteComponent>;
  let authState$: BehaviorSubject<any>;
  let service;
  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    service = HELPER.getMockService(authState$);
    TestBed.configureTestingModule({
      imports: [...HELPER.MOCK_IMPORTS],
      declarations: [
        LinkRouteComponent,
        ...HELPER.MOCK_UTILITIES_DECLARATIONS
       ],
      providers: [
          {provide: EzfaService, useValue: service},

      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(LinkRouteComponent);
    component = fixture.componentInstance as LinkRouteComponent;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have an ngUnsubscribe', () => {
    expect(component.ngUnsubscribe).toBeTruthy();
  });
  it('should have an service', () => {
    expect(component.service).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call onRoute', () => {
      spyOn(component.service, 'onRouteChange').and.callThrough();
      component.ngOnInit();
      expect(component.service.onRouteChange).toHaveBeenCalledWith('link');
    });
    it('should navigate away if providerId is not present in the params', () => {
      component.route.snapshot.queryParams = {};
      spyOn(component.service, 'navigate').and.callThrough();
      component.ngOnInit();
      expect(component.service.navigate).toHaveBeenCalledWith();
    });
    it ('should handle the case when there is a saved popup promise', fakeAsync(() => {
      spyOn(component, 'gateToSignedInUser').and.callFake(() => Promise.resolve());
      spyOn(component, 'onInitLoadUser').and.callFake(() => Promise.resolve());
      spyOn(component, 'onInitHandleSavedPopupPromise').and.callFake(() => Promise.resolve(true));
      spyOn(component, 'onInitCheckForRedirect').and.callThrough();
      spyOn(component, 'link').and.callFake(() => {});
      authState$.next(HELPER.MOCK_USER);
      component.route.snapshot.queryParams.providerId = 'twitter.com';
      component.ngOnInit();
      expect(component.onInitLoadUser).toHaveBeenCalled();
      tick();
      expect(component.onInitHandleSavedPopupPromise).toHaveBeenCalled();
      tick();
      expect(component.onInitCheckForRedirect).not.toHaveBeenCalled();
      tick();
      expect(component.link).not.toHaveBeenCalled();
      expect(component.gateToSignedInUser).toHaveBeenCalled();
    }));
    it ('should handle the case when there is a redirect', fakeAsync(() => {
      spyOn(component, 'gateToSignedInUser').and.callFake(() => Promise.resolve());
      spyOn(component, 'onInitLoadUser').and.callFake(() => Promise.resolve());
      spyOn(component, 'onInitHandleSavedPopupPromise').and.callFake(() => Promise.resolve(false));
      spyOn(component, 'onInitCheckForRedirect').and.callFake(() => Promise.resolve(true));
      spyOn(component, 'link').and.callFake(() => {});
      authState$.next(HELPER.MOCK_USER);
      component.route.snapshot.queryParams.providerId = 'twitter.com';
      component.ngOnInit();
      expect(component.onInitLoadUser).toHaveBeenCalled();
      tick();
      expect(component.onInitHandleSavedPopupPromise).toHaveBeenCalled();
      tick();
      expect(component.onInitCheckForRedirect).toHaveBeenCalled();
      tick();
      expect(component.link).not.toHaveBeenCalled();
      expect(component.gateToSignedInUser).toHaveBeenCalled();

    }));
    it ('should handle the case when there is neither a popup promise nor a redirect result', fakeAsync(() => {
      spyOn(component, 'gateToSignedInUser').and.callFake(() => Promise.resolve());
      spyOn(component, 'onInitLoadUser').and.callFake(() => Promise.resolve());
      spyOn(component, 'onInitHandleSavedPopupPromise').and.callFake(() => Promise.resolve(false));
      spyOn(component, 'onInitCheckForRedirect').and.callFake(() => Promise.resolve(false));
      spyOn(component, 'link').and.callFake(() => {});
      authState$.next(HELPER.MOCK_USER);
      component.route.snapshot.queryParams.providerId = 'twitter.com';
      component.ngOnInit();
      expect(component.onInitLoadUser).toHaveBeenCalled();
      tick();
      expect(component.onInitHandleSavedPopupPromise).toHaveBeenCalled();
      tick();
      expect(component.onInitCheckForRedirect).toHaveBeenCalled();
      tick();
      expect(component.link).toHaveBeenCalled();
      expect(component.gateToSignedInUser).toHaveBeenCalled();
    }));
  });


  describe('onError()', () => {
    it('should set props', () => {
      const err = Object.assign({}, HELPER.MOCK_ERROR);
      component.onError(err);
      expect(component.error).toBe(err);
      expect(component.success).toBe(null);
      expect(component.wait).toBe(false);
    });
  });

  describe('onSuccess(event: firebase.auth.UserCredential)', () => {
    it('should set props and redirect', () => {
      spyOn(component.service, 'navigate').and.callThrough();
      const cred = Object.assign({}, HELPER.MOCK_USER_CRED, {credential: {providerId: 'twitter.com'}});
      component.onSuccess(cred);
      expect(component.error).toBe(null);
      expect(component.success).toEqual(jasmine.any(EzfaProviderLinkedEvent));
      expect(component.wait).toBe(false);
      expect(component.service.navigate).toHaveBeenCalledWith('account', {queryParams: {message: Messages.twitterAccountAdded}});
    });
    it('should redirect with correct msg for facebook', () => {
      spyOn(component.service, 'navigate').and.callThrough();
      const cred = Object.assign({}, HELPER.MOCK_USER_CRED, {credential: {providerId: 'facebook.com'}});
      component.onSuccess(cred);
      expect(component.error).toBe(null);
      expect(component.success).toEqual(jasmine.any(EzfaProviderLinkedEvent));
      expect(component.wait).toBe(false);
      expect(component.service.navigate).toHaveBeenCalledWith('account', {queryParams: {message: Messages.facebookAccountAdded}});
    });
    it('should redirect with correct msg for google', () => {
      spyOn(component.service, 'navigate').and.callThrough();
      const cred = Object.assign({}, HELPER.MOCK_USER_CRED, {credential: {providerId: 'google.com'}});
      component.onSuccess(cred);
      expect(component.error).toBe(null);
      expect(component.success).toEqual(jasmine.any(EzfaProviderLinkedEvent));
      expect(component.wait).toBe(false);
      expect(component.service.navigate).toHaveBeenCalledWith('account', {queryParams: {message: Messages.googleAccountAdded}});
    });
    it('should redirect with correct msg for gh', () => {
      spyOn(component.service, 'navigate').and.callThrough();
      const cred = Object.assign({}, HELPER.MOCK_USER_CRED, {credential: {providerId: 'github.com'}});
      component.onSuccess(cred);
      expect(component.error).toBe(null);
      expect(component.success).toEqual(jasmine.any(EzfaProviderLinkedEvent));
      expect(component.wait).toBe(false);
      expect(component.service.navigate).toHaveBeenCalledWith('account', {queryParams: {message: Messages.githubAccountAdded}});
    });
  });



  describe('link', () => {
    it('should handle things if the redirect call fails', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER);
      component.user = user;
      component.service.oauthMethod = EzfaOauthMethod.redirect;
      spyOn(component.user, 'linkWithRedirect').and.callFake(() => Promise.reject(HELPER.MOCK_ERROR));
      spyOn(component, 'onSuccess').and.callThrough();
      spyOn(component, 'onError').and.callThrough();
      component.providerId = 'twitter.com';
      component.link();
      expect(component.onSuccess).not.toHaveBeenCalled();
      expect(component.onError).not.toHaveBeenCalled();
      expect(component.wait).toBe(true);
      tick();
      expect(component.onError).toHaveBeenCalledWith(HELPER.MOCK_ERROR);
    }));
    it('should handle things if the popup call fails', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER);
      component.user = user;
      component.service.oauthMethod = EzfaOauthMethod.popup;
      spyOn(component.user, 'linkWithPopup').and.callFake(() => Promise.reject(HELPER.MOCK_ERROR));
      spyOn(component, 'onSuccess').and.callThrough();
      spyOn(component, 'onError').and.callThrough();
      component.providerId = 'twitter.com';
      component.link();
      expect(component.onSuccess).not.toHaveBeenCalled();
      expect(component.onError).not.toHaveBeenCalled();
      expect(component.wait).toBe(true);
      tick();
      expect(component.onError).toHaveBeenCalledWith(HELPER.MOCK_ERROR);
    }));
    it('should handle things if the popup call succeeds', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER);
      component.user = user;
      component.service.oauthMethod = EzfaOauthMethod.popup;
      spyOn(component.user, 'linkWithPopup').and.callFake(() => Promise.resolve(HELPER.MOCK_USER_CRED));
      spyOn(component, 'onSuccess').and.callThrough();
      spyOn(component, 'onError').and.callThrough();
      component.providerId = 'twitter.com';
      component.link();
      expect(component.onSuccess).not.toHaveBeenCalled();
      expect(component.onError).not.toHaveBeenCalled();
      expect(component.wait).toBe(true);
      tick();
      expect(component.onSuccess).toHaveBeenCalledWith(HELPER.MOCK_USER_CRED);
    }));
  });
  describe('onInitHandleSavedPopupPromise', () => {
    it('should resolve with true and redirect if the user is not signed in', fakeAsync(() => {
      let resolved;
      spyOn(component.service, 'navigate').and.callThrough();
      component.user = null;
      component.onInitHandleSavedPopupPromise().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.service.navigate).toHaveBeenCalledWith();
    }));
    it('should resolve with false if no promise has been saved', fakeAsync(() => {
      let resolved;
      component.user = HELPER.MOCK_USER;
      spyOn(component, 'onSuccess').and.callThrough();
      spyOn(component, 'onError').and.callThrough();
      component.service.savedPopupPromise = null;
      component.onInitHandleSavedPopupPromise().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false);
      expect(component.onSuccess).not.toHaveBeenCalled();
      expect(component.onError).not.toHaveBeenCalled();
    }));
    it('should always set the saved fromise to null', fakeAsync(() => {
      const p = new Promise(resolve => {
        resolve();
      });
      component.service.savedPopupPromise = p;
      component.onInitHandleSavedPopupPromise();
      expect(component.service.savedPopupPromise).toBe(null);
    }));

    it('should resolve with true if there is a promise and it is successful', fakeAsync(() => {
      let resolved;
      component.user = HELPER.MOCK_USER;
      const cred = HELPER.MOCK_USER_CRED;
      const p = new Promise(resolve => {
        resolve(cred);
      });
      spyOn(component, 'onSuccess').and.callThrough();
      spyOn(component, 'onError').and.callThrough();
      component.service.savedPopupPromise = p;
      component.onInitHandleSavedPopupPromise().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.onSuccess).toHaveBeenCalledWith(cred);
      expect(component.onError).not.toHaveBeenCalled();
    }));
    it('should resolve with true if there is a promise and it fails', fakeAsync(() => {
      let resolved;
      component.user = HELPER.MOCK_USER;
      const p = new Promise((resolve, reject) => {
        reject(HELPER.MOCK_ERROR);
      });
      spyOn(component, 'onSuccess').and.callThrough();
      spyOn(component, 'onError').and.callThrough();
      component.service.savedPopupPromise = p;
      component.onInitHandleSavedPopupPromise().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.onSuccess).not.toHaveBeenCalled();
      expect(component.onError).toHaveBeenCalledWith(HELPER.MOCK_ERROR);
    }));
  });

  describe('onInitCheckForRedirect', () => {
    it('should resolve with true and redirect if the user is not signed in', fakeAsync(() => {
      let resolved;
      spyOn(component.service, 'navigate').and.callThrough();
      component.user = null;
      component.onInitCheckForRedirect().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.service.navigate).toHaveBeenCalledWith();
    }));
    it('should resolve with true if there is a redirect', fakeAsync(() => {
      let resolved;
      component.user = HELPER.MOCK_USER;
      spyOn(component.service.auth, 'getRedirectResult').and.callFake(() => Promise.resolve(HELPER.MOCK_USER_CRED));
      spyOn(component, 'onSuccess').and.callThrough();
      component.onInitCheckForRedirect().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.onSuccess).toHaveBeenCalledWith(HELPER.MOCK_USER_CRED);
    }));
    it('should resolve with false if there is no redirect', fakeAsync(() => {
      let resolved;
      component.user = HELPER.MOCK_USER;
      spyOn(component.service.auth, 'getRedirectResult').and.callFake(() => Promise.resolve({user: null}));
      spyOn(component, 'onSuccess').and.callThrough();
      component.onInitCheckForRedirect().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false);
      expect(component.onSuccess).not.toHaveBeenCalled();
    }));
    it('should resolve with true if there is a redirect but an error', fakeAsync(() => {
      let resolved;
      component.user = HELPER.MOCK_USER;
      spyOn(component.service.auth, 'getRedirectResult').and.callFake(() => Promise.reject(HELPER.MOCK_ERROR));
      spyOn(component, 'onError').and.callThrough();
      component.onInitCheckForRedirect().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.onError).toHaveBeenCalledWith(HELPER.MOCK_ERROR);
    }));
  });

});
