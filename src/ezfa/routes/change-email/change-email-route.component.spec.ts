import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, FormControl} from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { MockComponent } from 'ng2-mock-component';
import * as _ from 'lodash';

import { EzfaService } from '../../ezfa.service';
import * as Utils from '../utils';
import { Messages } from '../messages.enum';

import { ChangeEmailRouteComponent } from './change-email-route.component';
import * as HELPER from '../../test';


describe('ChangeEmailRouteComponent angular sanity check', () => {
  let component: ChangeEmailRouteComponent;
  let fixture: ComponentFixture<ChangeEmailRouteComponent>;

  let service;
  let authState$: BehaviorSubject<any>;

  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    service = HELPER.getMockService(authState$);
    TestBed.configureTestingModule({
      declarations: [
        ChangeEmailRouteComponent,
        ...HELPER.MOCK_UTILITIES_DECLARATIONS
      ],
      imports: [ ...HELPER.MOCK_IMPORTS ],
      providers: [
        {provide: EzfaService, useValue: service},
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ChangeEmailRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should call onRoute', fakeAsync(() => {
      spyOn(component.service, 'onRouteChange').and.callThrough();
      component.ngOnInit();
      expect(component.service.onRouteChange).toHaveBeenCalledWith('change-email');
    }));
    it('should set the id', fakeAsync(() => {
      component.ngOnInit();
      expect(component.id).toBeTruthy();
    }));
    it('should set the fg', fakeAsync(() => {
      component.ngOnInit();
      expect(component.fg.get('email')).toBeTruthy();
    }));
    it('should gate to users with password', fakeAsync(() => {
      spyOn(component, 'onInitLoadUser').and.callThrough();
      spyOn(component, 'gateToUserWithPassword').and.callThrough();
      component.ngOnInit();
      expect(component.onInitLoadUser).toHaveBeenCalled();
      tick();
      expect(component.gateToUserWithPassword).toHaveBeenCalledWith();
    }));
    it('should clear the invalid email err', fakeAsync(() => {
      authState$.next(HELPER.MOCK_USER);
      component.ngOnInit();
      const fc = component.fg.get('email');
      fc.setValue('foo');
      fc.setErrors({'auth/invalid-email': true});
      expect(fc.hasError('auth/invalid-email')).toBe(true);
      fc.setValue('foob');
      tick();
      expect(fc.hasError('auth/invalid-email')).toBe(false);
    }));
    it('should clear the email-already-in-use err', fakeAsync(() => {
      authState$.next(HELPER.MOCK_USER);
      component.ngOnInit();
      const fc = component.fg.get('email');
      fc.setValue('foo');
      fc.setErrors({'auth/email-already-in-use': true});
      expect(fc.hasError('auth/email-already-in-use')).toBe(true);
      fc.setValue('foob');
      tick();
      expect(fc.hasError('auth/email-already-in-use')).toBe(false);
    }));
  });

  describe('validateNotSame(fc)',  () => {
    it('should return null if there is no user', () => {
      const fc = new FormControl('a@b.com');
      component.user = null;
      expect(component.validateNotSame(fc)).toBe(null);
    });
    it('should return null if the email is not the same', () => {
      const fc = new FormControl('a@b.com');
      component.user = Object.assign({}, HELPER.MOCK_USER, {email: 'c@b.com'});
      expect(component.validateNotSame(fc)).toBe(null);
    });
    it('should return {same: true} if the email is the same', () => {
      const fc = new FormControl('a@b.com');
      component.user = Object.assign({}, HELPER.MOCK_USER, {email: 'a@b.com'});
      expect(component.validateNotSame(fc)).toEqual({same: true});
    });
  });

  describe('submit()', () => {
    it('should return if there is no user', () => {
      expect(component.submitting).toBe(false);
      component.user = null;
      component.submit();
      expect(component.submitting).toBe(false);
    });
    it('should work', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER);
      authState$.next(user);
      component.ngOnInit();
      component.fg.get('email').setValue('a@b.co');
      component.service.sendEmailVerificationLink = true;
      tick();
      spyOn(component.user, 'updateEmail').and.callThrough();
      spyOn(component.user, 'sendEmailVerification').and.callThrough();
      spyOn(component.service, 'onEmailChanged').and.callThrough();
      spyOn(component.service, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updateEmail).toHaveBeenCalledWith('a@b.co');
      expect(component.user.sendEmailVerification).toHaveBeenCalledWith();
      expect(component.service.onEmailChanged).toHaveBeenCalledWith({user: user, newEmail: 'a@b.co', oldEmail: 'foo@bar.com'});
      expect(component.service.navigate).toHaveBeenCalledWith('account', {queryParams: {message: Messages.emailSaved}});
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
    }));
    it('should work if sendEmailVerificationLink is false', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER);
      authState$.next(user);
      component.ngOnInit();
      component.fg.get('email').setValue('a@b.co');
      component.service.sendEmailVerificationLink = false;
      tick();
      spyOn(component.user, 'updateEmail').and.callThrough();
      spyOn(component.user, 'sendEmailVerification').and.callThrough();
      spyOn(component.service, 'onEmailChanged').and.callThrough();
      spyOn(component.service, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updateEmail).toHaveBeenCalledWith('a@b.co');
      expect(component.user.sendEmailVerification).not.toHaveBeenCalled();
      expect(component.service.onEmailChanged).toHaveBeenCalledWith({user: user, newEmail: 'a@b.co', oldEmail: 'foo@bar.com'});
      expect(component.service.navigate).toHaveBeenCalledWith('account', {queryParams: {message: Messages.emailSaved}});
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
    }));

    it('should handle the invalid-email err', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER);
      authState$.next(user);
      component.ngOnInit();
      component.fg.get('email').setValue('a@b.co');
      component.service.sendEmailVerificationLink = true;
      tick();
      spyOn(component.user, 'updateEmail').and.callFake(() => Promise.reject({code: 'auth/invalid-email'}));
      spyOn(component.user, 'sendEmailVerification').and.callThrough();
      spyOn(component.service, 'onEmailChanged').and.callThrough();
      spyOn(component.service, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updateEmail).toHaveBeenCalledWith('a@b.co');
      expect(component.user.sendEmailVerification).not.toHaveBeenCalled();
      expect(component.service.onEmailChanged).not.toHaveBeenCalled();
      expect(component.service.navigate).not.toHaveBeenCalled();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
      expect(component.fg.get('email').hasError('auth/invalid-email')).toBe(true);
    }));

    it('should handle the email-already-in-use err', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER);
      authState$.next(user);
      component.ngOnInit();
      component.fg.get('email').setValue('a@b.co');
      component.service.sendEmailVerificationLink = true;
      tick();
      spyOn(component.user, 'updateEmail').and.callFake(() => Promise.reject({code: 'auth/email-already-in-use'}));
      spyOn(component.user, 'sendEmailVerification').and.callThrough();
      spyOn(component.service, 'onEmailChanged').and.callThrough();
      spyOn(component.service, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updateEmail).toHaveBeenCalledWith('a@b.co');
      expect(component.user.sendEmailVerification).not.toHaveBeenCalled();
      expect(component.service.onEmailChanged).not.toHaveBeenCalled();
      expect(component.service.navigate).not.toHaveBeenCalled();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
      expect(component.fg.get('email').hasError('auth/email-already-in-use')).toBe(true);
    }));

    it('should handle the requires-recent-login err', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER);
      authState$.next(user);
      component.ngOnInit();
      component.fg.get('email').setValue('a@b.co');
      component.service.sendEmailVerificationLink = true;
      tick();
      spyOn(component.user, 'updateEmail').and.callFake(() => Promise.reject({code: 'auth/requires-recent-login'}));
      spyOn(component.user, 'sendEmailVerification').and.callThrough();
      spyOn(component.service, 'onEmailChanged').and.callThrough();
      spyOn(component.service, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updateEmail).toHaveBeenCalledWith('a@b.co');
      expect(component.user.sendEmailVerification).not.toHaveBeenCalled();
      expect(component.service.onEmailChanged).not.toHaveBeenCalled();
      expect(component.service.navigate).toHaveBeenCalledWith('reauthenticate', {queryParams: {redirect: 'change-email'}});
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
    }));
    it('should handle other errors', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER);
      authState$.next(user);
      component.ngOnInit();
      component.fg.get('email').setValue('a@b.co');
      component.service.sendEmailVerificationLink = true;
      tick();
      spyOn(component.user, 'updateEmail').and.callFake(() => Promise.reject({code: 'auth/other'}));
      spyOn(component.user, 'sendEmailVerification').and.callThrough();
      spyOn(component.service, 'onEmailChanged').and.callThrough();
      spyOn(component.service, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updateEmail).toHaveBeenCalledWith('a@b.co');
      expect(component.user.sendEmailVerification).not.toHaveBeenCalled();
      expect(component.service.onEmailChanged).not.toHaveBeenCalled();
      expect(component.service.navigate).not.toHaveBeenCalled();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toEqual({code: 'auth/other'});
    }));
  });
});
