import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MockComponent } from 'ng2-mock-component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SfaMessages } from '../messages.enum';
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
  MOCK_USER_INFO_FACEBOOK,
  MOCK_USER_INFO_GOOGLE,
 } from '../test';

import { UnlinkRouteComponent } from './unlink-route.component';

describe('UnlinkRouteComponent angular sanity check', () => {
  let component: UnlinkRouteComponent;
  let fixture: ComponentFixture<UnlinkRouteComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        UnlinkRouteComponent,
        ...MOCK_UTILITIES_DECLARATIONS
      ],
      providers: [...MOCK_PROVIDERS],
      imports: [...MOCK_IMPORTS]
    })
    .compileComponents();
    fixture = TestBed.createComponent(UnlinkRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

describe('UnlinkRouteComponent', () => {
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
    component = new UnlinkRouteComponent(route, sfaService);
  });

  describe('submit', () => {
    let navSpy;
    beforeEach(() => {
      navSpy = spyOn(component.authService, 'navigate').and.callThrough();
    });
    it('should work for password', fakeAsync(() => {
      const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_PASSWORD, MOCK_USER_INFO_GOOGLE]});
      const unlinkSpy = spyOn(user, 'unlink').and.callThrough();
      component.user = user;
      component.providerId = 'password';
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
      expect(navSpy).toHaveBeenCalledWith('account', {queryParams: {message: SfaMessages.passwordRemoved}})
    }))
    it('should work for twitter', fakeAsync(() => {
      const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_TWITTER, MOCK_USER_INFO_GOOGLE]});
      const unlinkSpy = spyOn(user, 'unlink').and.callThrough();
      component.user = user;
      component.providerId = 'twitter.com';
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
      expect(navSpy).toHaveBeenCalledWith('account', {queryParams: {message: SfaMessages.twitterAccountRemoved}})
    }))
    it('should work for facebook', fakeAsync(() => {
      const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_FACEBOOK, MOCK_USER_INFO_GOOGLE]});
      const unlinkSpy = spyOn(user, 'unlink').and.callThrough();
      component.user = user;
      component.providerId = 'facebook.com';
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
      expect(navSpy).toHaveBeenCalledWith('account', {queryParams: {message: SfaMessages.facebookAccountRemoved}})
    }))
    it('should work for github', fakeAsync(() => {
      const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_GITHUB, MOCK_USER_INFO_GOOGLE]});
      const unlinkSpy = spyOn(user, 'unlink').and.callThrough();
      component.user = user;
      component.providerId = 'github.com';
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
      expect(navSpy).toHaveBeenCalledWith('account', {queryParams: {message: SfaMessages.githubAccountRemoved}})
    }))
    it('should work for google', fakeAsync(() => {
      const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_GITHUB, MOCK_USER_INFO_GOOGLE]});
      const unlinkSpy = spyOn(user, 'unlink').and.callThrough();
      component.user = user;
      component.providerId = 'google.com';
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
      expect(navSpy).toHaveBeenCalledWith('account', {queryParams: {message: SfaMessages.googleAccountRemoved}})
    }))
    it('should handle an error', fakeAsync(() => {
      const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_GITHUB, MOCK_USER_INFO_GOOGLE]});
      const unlinkSpy = spyOn(user, 'unlink').and.callFake(() => Promise.reject({code: 'auth/other'}))
      component.user = user;
      component.providerId = 'google.com';
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
      expect(navSpy).not.toHaveBeenCalled();
      expect(component.unhandledError).toEqual({code: 'auth/other'})
    }))
  })

  describe('gateByUserAndProvider', () => {
    let navSpy;
    beforeEach(() => {
      navSpy = spyOn(component.authService, 'navigate').and.callThrough();
    })
    it('should navigate if there is no user', () => {
      authState$.next(null);
      component.route.snapshot.queryParams.providerId = 'twitter.com';
      component.gateByUserAndProvider();
      expect(navSpy).toHaveBeenCalledWith();
    });
    it('should navigate if providerId is not passed in the url', () => {
      delete component.route.snapshot.queryParams.providerId;
      const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_GITHUB]});
      authState$.next(user);
      component.gateByUserAndProvider();
      expect(navSpy).toHaveBeenCalledWith();
    })
    it('should  navigate if providerId is passed in the url but the user does not have that provider', () => {
      component.route.snapshot.queryParams.providerId = 'twitter.com';
      const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_GITHUB]});
      authState$.next(user);
      component.gateByUserAndProvider();
      expect(navSpy).toHaveBeenCalledWith();
      expect(component.providerId).toBe('twitter.com')
    })
    it('should not navigate if providerId is passed in the url and the user has that provider', () => {
      component.route.snapshot.queryParams.providerId = 'github.com';
      const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_GITHUB]});
      authState$.next(user);
      component.gateByUserAndProvider();
      expect(navSpy).not.toHaveBeenCalled();
      expect(component.providerId).toBe('github.com')
    })
  })
})
