import { fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as firebase from 'firebase';
import * as TEST_HELPERS from '../test';
import { BaseComponent } from './base.component';

describe('BaseComponent', () => {
  class ImplementedComponent extends BaseComponent {
    constructor(service: any) {
      super(service);
    }
  }
  let component: ImplementedComponent;
  let authState$: BehaviorSubject<any>;
  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    const service = Object.assign({}, TEST_HELPERS.getMockService(), {
      authState: authState$.asObservable(),
      configuredProviderIds: ['password', 'twitter.com', 'facebook.com', 'google.com', 'github.com'],
      oAuthProviderIds: ['twitter.com', 'facebook.com', 'google.com', 'github.com']
    });
    component = new ImplementedComponent(service);
  });
  it('should have an ngUnsubscribe', () => {
    expect(component.ngUnsubscribe).toBeTruthy();
  });
  it('should have an service', () => {
    expect(component.service).toBeTruthy();
  });

  describe('ngOnDestroy()', () => {
    it('should call ngUnsubscribe.next() and ngUnsubscribe.complete()', fakeAsync(() => {
      spyOn(component.ngUnsubscribe, 'next').and.callThrough();
      spyOn(component.ngUnsubscribe, 'complete').and.callThrough();
      component.ngOnDestroy();
      expect(component.ngUnsubscribe.next).toHaveBeenCalledWith();
      expect(component.ngUnsubscribe.complete).toHaveBeenCalledWith();
    }));
  });

  describe('onInitLoadUser()', () => {
    it('should return a promise that completes after the authState is taken once', fakeAsync(() => {
      let resolved;
      spyOn(component, 'onAuthChangedUpdate').and.callThrough();
      const user = Object.assign({}, TEST_HELPERS.MOCK_USER, {providerData: [TEST_HELPERS.MOCK_USER_INFO_GITHUB]});
      authState$.next(user);
      component.onInitLoadUser().then(_ => resolved = true);
      tick();
      expect(resolved).toBe(true);
    }));
    it('should continue to observe the auth state', fakeAsync(() => {
      spyOn(component, 'onAuthChangedUpdate').and.callThrough();
      const user = Object.assign({}, TEST_HELPERS.MOCK_USER, {providerData: [TEST_HELPERS.MOCK_USER_INFO_GITHUB]});
      authState$.next(user);
      component.onInitLoadUser();
      tick();
      expect(component.onAuthChangedUpdate).toHaveBeenCalledTimes(2);
      authState$.next(null);
      tick();
      expect(component.onAuthChangedUpdate).toHaveBeenCalledTimes(3);
    }));
  });

  describe('gateToSignedInUser()', () => {
    it('should navigate if the user is signed out', fakeAsync(() => {
      spyOn(component.service, 'navigate').and.callThrough();
      authState$.next(TEST_HELPERS.MOCK_USER);
      component.gateToSignedInUser();
      tick();
      expect(component.service.navigate).not.toHaveBeenCalled();
      authState$.next(null);
      tick();
      expect(component.service.navigate).toHaveBeenCalled();
    }));
  });

  describe('gateToUserWithNoPassword()', () => {
    it('should navigate if the user is signed in and has a password', fakeAsync(() => {
      spyOn(component.service, 'navigate').and.callThrough();
      const user = Object.assign({}, TEST_HELPERS.MOCK_USER, {providerData: [TEST_HELPERS.MOCK_USER_INFO_PASSWORD]});
      authState$.next(user);
      component.gateToUserWithNoPassword();
      tick();
      expect(component.service.navigate).toHaveBeenCalled();
    }));
    it('should navigate if the user is null', fakeAsync(() => {
      spyOn(component.service, 'navigate').and.callThrough();
      authState$.next(null);
      component.gateToUserWithNoPassword();
      tick();
      expect(component.service.navigate).toHaveBeenCalled();
    }));
    it('should not navigate if the user is signed in but has no password', fakeAsync(() => {
      spyOn(component.service, 'navigate').and.callThrough();
      const user = Object.assign({}, TEST_HELPERS.MOCK_USER, {providerData: [TEST_HELPERS.MOCK_USER_INFO_TWITTER]});
      authState$.next(user);
      component.gateToUserWithNoPassword();
      tick();
      expect(component.service.navigate).not.toHaveBeenCalled();
    }));
  });
  describe('gateToUserWithPassword()', () => {
    it('should navigate if the user is signed in but has no password', fakeAsync(() => {
      spyOn(component.service, 'navigate').and.callThrough();
      const user = Object.assign({}, TEST_HELPERS.MOCK_USER, {providerData: [TEST_HELPERS.MOCK_USER_INFO_FACEBOOK]});
      authState$.next(user);
      component.gateToUserWithPassword();
      tick();
      expect(component.service.navigate).toHaveBeenCalled();
    }));
    it('should navigate if the user is null', fakeAsync(() => {
      spyOn(component.service, 'navigate').and.callThrough();
      authState$.next(null);
      component.gateToUserWithPassword();
      tick();
      expect(component.service.navigate).toHaveBeenCalled();
    }));
    it('should not navigate if the user is signed in and has a password', fakeAsync(() => {
      spyOn(component.service, 'navigate').and.callThrough();
      const user = Object.assign({}, TEST_HELPERS.MOCK_USER, {providerData: [TEST_HELPERS.MOCK_USER_INFO_PASSWORD]});
      authState$.next(user);
      component.gateToUserWithPassword();
      tick();
      expect(component.service.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('onAuthChangedUpdate(user)', () => {
    it ('should set the user and userProviderData', () => {
      component.onAuthChangedUpdate(null);
      expect(component.user).toBe(null);
      expect(component.userProviderData).toBeTruthy();
    });
  });
});
