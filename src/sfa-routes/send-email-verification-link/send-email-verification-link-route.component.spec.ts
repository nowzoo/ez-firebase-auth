import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET
 } from '../test';


import { SendEmailVerificationLinkRouteComponent } from './send-email-verification-link-route.component';


describe('SendEmailVerificationLinkRouteComponent angular sanity check', () => {
  let component: SendEmailVerificationLinkRouteComponent;
  let fixture: ComponentFixture<SendEmailVerificationLinkRouteComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...MOCK_IMPORTS
      ],
      declarations: [
        SendEmailVerificationLinkRouteComponent,
        ...MOCK_UTILITIES_DECLARATIONS
      ],
      providers: [
        ...MOCK_PROVIDERS
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(SendEmailVerificationLinkRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

describe('SendEmailVerificationLinkRouteComponent', () => {
  let component;
  let authState$: BehaviorSubject<any>;
  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    const sfaService: any = Object.assign({}, MOCK_AUTH_SERVICE_GET(), {
      authState: authState$.asObservable(),
      configuredProviderIds: ['password', 'twitter.com', 'facebook.com', 'google.com', 'github.com'],
      oAuthProviderIds: ['twitter.com', 'facebook.com', 'google.com', 'github.com']
    });
    component = new SendEmailVerificationLinkRouteComponent(sfaService);
  });

  describe('ngOnInit', () => {
    let navSpy;

    beforeEach(() => {
      spyOn(component, 'onInitLoadUser').and.callThrough();
      navSpy = spyOn(component.authService, 'navigate').and.callThrough();
      authState$.next(MOCK_USER);
    });
    it('should navigate if there is no signed in user', fakeAsync(() => {
      authState$.next(null);
      component.ngOnInit();
      tick();
      expect(navSpy).toHaveBeenCalledWith();
    }))
    it('should not navigate if there is a signed in user', fakeAsync(() => {
      authState$.next(MOCK_USER);
      component.ngOnInit();
      tick();
      expect(navSpy).not.toHaveBeenCalled();
    }))
    it('should navigate if the user is subsequently signed out', fakeAsync(() => {
      authState$.next(MOCK_USER);
      component.ngOnInit();
      tick();
      expect(navSpy).not.toHaveBeenCalled();
      authState$.next(null);
      tick();
      expect(navSpy).toHaveBeenCalledWith();
    }))
    it('should show the form if the user is not verified', fakeAsync(() => {
      const user = Object.assign({}, MOCK_USER, {emailVerified: false});
      authState$.next(user);
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('form');
    }))
    it('should show the alreadyVerified screen if the user is verified', fakeAsync(() => {
      const user = Object.assign({}, MOCK_USER, {emailVerified: true});
      authState$.next(user);
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('alreadyVerified');
    }))
  })

  describe('submit()', () => {
    let spySend;
    beforeEach(() => {
      component.user =  Object.assign({}, MOCK_USER);
      spySend = spyOn(component.user, 'sendEmailVerification').and.callThrough();
      component.screen = 'form';
    });
    it('should handle success', fakeAsync(() => {
      component.submit();
      expect(component.error).toBe(null);
      expect(component.submitting).toBe(true);
      expect(spySend).toHaveBeenCalledWith();
      tick();
      expect(component.error).toBe(null);
      expect(component.submitting).toBe(false);
      expect(component.screen).toBe('success');
    }));
    it('should handle failure', fakeAsync(() => {
      spySend.and.callFake(() => Promise.reject({code: 'auth/error'}))
      component.submit();
      expect(component.error).toBe(null);
      expect(component.submitting).toBe(true);
      expect(spySend).toHaveBeenCalledWith();
      tick();
      expect(component.error).toEqual({code: 'auth/error'});
      expect(component.submitting).toBe(false);
      expect(component.screen).toBe('form');
    }));
  })
});
