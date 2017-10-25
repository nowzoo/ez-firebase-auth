import { fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as firebase from 'firebase';
import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET,
  MOCK_USER_INFO_GITHUB,
  MOCK_USER_INFO_PASSWORD,
  MOCK_USER_INFO_TWITTER,
  MOCK_USER_INFO_FACEBOOK
 } from './test';
import { BaseComponent } from './base.component';

describe('BaseComponent', () => {
  class SfaChildComponent extends BaseComponent {
    constructor(authService: any) {
      super(authService);
    }
  }
  let component: SfaChildComponent;
  let authState$: BehaviorSubject<any>;
  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    const sfaService = Object.assign({}, MOCK_AUTH_SERVICE_GET(), {
      authState: authState$.asObservable(),
      configuredProviderIds: ['password', 'twitter.com', 'facebook.com', 'google.com', 'github.com'],
      oAuthProviderIds: ['twitter.com', 'facebook.com', 'google.com', 'github.com']
    });
    component = new SfaChildComponent(sfaService);
  });
  it('should have an ngUnsubscribe', () => {
    expect(component.ngUnsubscribe).toBeTruthy()
  })
  it('should have an authService', () => {
    expect(component.authService).toBeTruthy()
  })

  describe('ngOnDestroy()', () => {
    it('should call ngUnsubscribe.next() and ngUnsubscribe.complete()', fakeAsync(() => {
      spyOn(component.ngUnsubscribe, 'next').and.callThrough()
      spyOn(component.ngUnsubscribe, 'complete').and.callThrough()
      component.ngOnDestroy();
      expect(component.ngUnsubscribe.next).toHaveBeenCalledWith();
      expect(component.ngUnsubscribe.complete).toHaveBeenCalledWith();
    }))
  })

  describe('onInitLoadUser()', () => {
    it('should return a promise that completes after the authState is taken once', fakeAsync(() => {
      let resolved;
      spyOn(component, 'onAuthChangedUpdate').and.callThrough()
      const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_GITHUB]});
      authState$.next(user);
      component.onInitLoadUser().then(_ => resolved = true);
      tick();
      expect(resolved).toBe(true);
    }))
    it('should continue to observe the auth state', fakeAsync(() => {
      spyOn(component, 'onAuthChangedUpdate').and.callThrough()
      const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_GITHUB]});
      authState$.next(user);
      component.onInitLoadUser()
      tick();
      expect(component.onAuthChangedUpdate).toHaveBeenCalledTimes(2);
      authState$.next(null);
      tick();
      expect(component.onAuthChangedUpdate).toHaveBeenCalledTimes(3);
    }))
  })

  describe('gateToSignedInUser()', () => {
    it('should navigate if the user is signed out', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough()
      authState$.next(MOCK_USER);
      component.gateToSignedInUser();
      tick();
      expect(component.authService.navigate).not.toHaveBeenCalled();
      authState$.next(null);
      tick();
      expect(component.authService.navigate).toHaveBeenCalled();
    }));
  })

  describe('gateToUserWithNoPassword()', () => {
    it('should navigate if the user is signed in and has a password', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_PASSWORD]})
      authState$.next(user);
      component.gateToUserWithNoPassword();
      tick();
      expect(component.authService.navigate).toHaveBeenCalled();
    }));
    it('should navigate if the user is null', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      authState$.next(null);
      component.gateToUserWithNoPassword();
      tick();
      expect(component.authService.navigate).toHaveBeenCalled();
    }));
    it('should not navigate if the user is signed in but has no password', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_TWITTER]})
      authState$.next(user);
      component.gateToUserWithNoPassword();
      tick();
      expect(component.authService.navigate).not.toHaveBeenCalled();
    }));
  })
  describe('gateToUserWithPassword()', () => {
    it('should navigate if the user is signed in but has no password', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_FACEBOOK]})
      authState$.next(user);
      component.gateToUserWithPassword();
      tick();
      expect(component.authService.navigate).toHaveBeenCalled();
    }));
    it('should navigate if the user is null', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      authState$.next(null);
      component.gateToUserWithPassword();
      tick();
      expect(component.authService.navigate).toHaveBeenCalled();
    }));
    it('should not navigate if the user is signed in and has a password', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_PASSWORD]})
      authState$.next(user);
      component.gateToUserWithPassword();
      tick();
      expect(component.authService.navigate).not.toHaveBeenCalled();
    }));
  })

  describe('onAuthChangedUpdate(user)', () => {
    it ('should set the user and userProviderData', () => {
      component.onAuthChangedUpdate(null);
      expect(component.user).toBe(null);
      expect(component.userProviderData).toBeTruthy();
    });
  })
})
