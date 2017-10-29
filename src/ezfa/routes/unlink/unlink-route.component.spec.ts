import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MockComponent } from 'ng2-mock-component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EzfaService } from '../../ezfa.service';


import { EzfaProviderUnlinkedEvent} from '../../ezfa-provider-unlinked-event.class';
import { Messages } from '../messages.enum';
import * as HELPER from '../../test';

import { UnlinkRouteComponent } from './unlink-route.component';

describe('UnlinkRouteComponent angular sanity check', () => {
  let component: UnlinkRouteComponent;
  let fixture: ComponentFixture<UnlinkRouteComponent>;
  let authState$: BehaviorSubject<any>;
  let service;


  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    service = HELPER.getMockService(authState$);

    TestBed.configureTestingModule({
      declarations: [
        UnlinkRouteComponent,
        ...HELPER.MOCK_UTILITIES_DECLARATIONS
      ],
      providers: [
        {provide: EzfaService, useValue: service}
      ],
      imports: [...HELPER.MOCK_IMPORTS]
    })
    .compileComponents();
    fixture = TestBed.createComponent(UnlinkRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
  describe('submit', () => {
    let navSpy;
    let eventSpy;
    beforeEach(() => {
      navSpy = spyOn(component.service, 'navigate').and.callThrough();
      eventSpy = spyOn(component.service, 'onProviderUnlinked').and.callThrough();
    });
    it('should work for password', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER, {providerData: [HELPER.MOCK_USER_INFO_PASSWORD, HELPER.MOCK_USER_INFO_GOOGLE]});
      const unlinkSpy = spyOn(user, 'unlink').and.callThrough();
      component.user = user;
      component.providerId = 'password';
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
      expect(navSpy).toHaveBeenCalledWith('account', {queryParams: {message: Messages.passwordRemoved}});
    }));
    it('should work for twitter', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER, {providerData: [HELPER.MOCK_USER_INFO_TWITTER, HELPER.MOCK_USER_INFO_GOOGLE]});
      const unlinkSpy = spyOn(user, 'unlink').and.callThrough();
      component.user = user;
      component.providerId = 'twitter.com';
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
      expect(navSpy).toHaveBeenCalledWith('account', {queryParams: {message: Messages.twitterAccountRemoved}});
    }));
    it('should work for facebook', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER, {providerData: [HELPER.MOCK_USER_INFO_FACEBOOK, HELPER.MOCK_USER_INFO_GOOGLE]});
      const unlinkSpy = spyOn(user, 'unlink').and.callThrough();
      component.user = user;
      component.providerId = 'facebook.com';
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
      expect(navSpy).toHaveBeenCalledWith('account', {queryParams: {message: Messages.facebookAccountRemoved}});
    }));
    it('should work for github', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER, {providerData: [HELPER.MOCK_USER_INFO_GITHUB, HELPER.MOCK_USER_INFO_GOOGLE]});
      const unlinkSpy = spyOn(user, 'unlink').and.callThrough();
      component.user = user;
      component.providerId = 'github.com';
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
      expect(navSpy).toHaveBeenCalledWith('account', {queryParams: {message: Messages.githubAccountRemoved}});
    }));
    it('should work for google', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER, {providerData: [HELPER.MOCK_USER_INFO_GITHUB, HELPER.MOCK_USER_INFO_GOOGLE]});
      const unlinkSpy = spyOn(user, 'unlink').and.callThrough();
      component.user = user;
      component.providerId = 'google.com';
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
      expect(navSpy).toHaveBeenCalledWith('account', {queryParams: {message: Messages.googleAccountRemoved}});
    }));
    it('should handle an error', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER, {providerData: [HELPER.MOCK_USER_INFO_GITHUB, HELPER.MOCK_USER_INFO_GOOGLE]});
      const unlinkSpy = spyOn(user, 'unlink').and.callFake(() => Promise.reject({code: 'auth/other'}));
      component.user = user;
      component.providerId = 'google.com';
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
      expect(navSpy).not.toHaveBeenCalled();
      expect(component.unhandledError).toEqual({code: 'auth/other'});
    }));
  });

  describe('gateByUserAndProvider', () => {
    let navSpy;
    beforeEach(() => {
      navSpy = spyOn(component.service, 'navigate').and.callThrough();
    });
    it('should navigate if there is no user', () => {
      authState$.next(null);
      component.route.snapshot.queryParams.providerId = 'twitter.com';
      component.gateByUserAndProvider();
      expect(navSpy).toHaveBeenCalledWith();
    });
    it('should navigate if providerId is not passed in the url', () => {
      delete component.route.snapshot.queryParams.providerId;
      const user = Object.assign({}, HELPER.MOCK_USER, {providerData: [HELPER.MOCK_USER_INFO_GITHUB]});
      authState$.next(user);
      component.gateByUserAndProvider();
      expect(navSpy).toHaveBeenCalledWith();
    });
    it('should  navigate if providerId is passed in the url but the user does not have that provider', () => {
      component.route.snapshot.queryParams.providerId = 'twitter.com';
      const user = Object.assign({}, HELPER.MOCK_USER, {providerData: [HELPER.MOCK_USER_INFO_GITHUB]});
      authState$.next(user);
      component.gateByUserAndProvider();
      expect(navSpy).toHaveBeenCalledWith();
      expect(component.providerId).toBe('twitter.com');
    });
    it('should not navigate if providerId is passed in the url and the user has that provider', () => {
      component.route.snapshot.queryParams.providerId = 'github.com';
      const user = Object.assign({}, HELPER.MOCK_USER, {providerData: [HELPER.MOCK_USER_INFO_GITHUB]});
      authState$.next(user);
      component.gateByUserAndProvider();
      expect(navSpy).not.toHaveBeenCalled();
      expect(component.providerId).toBe('github.com');
    });
  });
});
