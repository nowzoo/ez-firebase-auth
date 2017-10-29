import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as HELPER from '../../test';

import { EzfaService } from '../../ezfa.service';

import { SendEmailVerificationLinkRouteComponent } from './send-email-verification-link-route.component';


describe('SendEmailVerificationLinkRouteComponent angular sanity check', () => {
  let component: SendEmailVerificationLinkRouteComponent;
  let fixture: ComponentFixture<SendEmailVerificationLinkRouteComponent>;
  let authState$: BehaviorSubject<any>;
  let service;


  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    service = HELPER.getMockService(authState$);

    TestBed.configureTestingModule({
      imports: [
        ...HELPER.MOCK_IMPORTS
      ],
      declarations: [
        SendEmailVerificationLinkRouteComponent,
        ...HELPER.MOCK_UTILITIES_DECLARATIONS
      ],
      providers: [
          {provide: EzfaService, useValue: service}
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

  describe('ngOnInit', () => {
    let navSpy;

    beforeEach(() => {
      spyOn(component, 'onInitLoadUser').and.callThrough();
      navSpy = spyOn(component.service, 'navigate').and.callThrough();
      authState$.next(HELPER.MOCK_USER);
    });
    it('should navigate if there is no signed in user', fakeAsync(() => {
      authState$.next(null);
      component.ngOnInit();
      tick();
      expect(navSpy).toHaveBeenCalledWith();
    }));
    it('should not navigate if there is a signed in user', fakeAsync(() => {
      authState$.next(HELPER.MOCK_USER);
      component.ngOnInit();
      tick();
      expect(navSpy).not.toHaveBeenCalled();
    }));
    it('should navigate if the user is subsequently signed out', fakeAsync(() => {
      authState$.next(HELPER.MOCK_USER);
      component.ngOnInit();
      tick();
      expect(navSpy).not.toHaveBeenCalled();
      authState$.next(null);
      tick();
      expect(navSpy).toHaveBeenCalledWith();
    }));
    it('should show the form if the user is not verified', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER, {emailVerified: false});
      authState$.next(user);
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('form');
    }));
    it('should show the alreadyVerified screen if the user is verified', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER, {emailVerified: true});
      authState$.next(user);
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('alreadyVerified');
    }));
  });

  describe('submit()', () => {
    let spySend;
    beforeEach(() => {
      component.user =  Object.assign({}, HELPER.MOCK_USER);
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
      spySend.and.callFake(() => Promise.reject({code: 'auth/error'}));
      component.submit();
      expect(component.error).toBe(null);
      expect(component.submitting).toBe(true);
      expect(spySend).toHaveBeenCalledWith();
      tick();
      expect(component.error).toEqual({code: 'auth/error'});
      expect(component.submitting).toBe(false);
      expect(component.screen).toBe('form');
    }));
  });
});
