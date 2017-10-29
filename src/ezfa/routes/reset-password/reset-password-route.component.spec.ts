import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as HELPER from '../../test';
import { EzfaService } from '../../ezfa.service';
import { Messages } from '../messages.enum';

import { ResetPasswordRouteComponent } from './reset-password-route.component';

describe('ResetPasswordRouteComponent', () => {
  let component: ResetPasswordRouteComponent;
  let fixture: ComponentFixture<ResetPasswordRouteComponent>;
  let authState$: BehaviorSubject<any>;
  let service;
  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    service = HELPER.getMockService(authState$);
    TestBed.configureTestingModule({
      imports: [...HELPER.MOCK_IMPORTS],
      declarations: [
        ResetPasswordRouteComponent,
        ...HELPER.MOCK_UTILITIES_DECLARATIONS
      ],
      providers: [
        {provide: EzfaService, useValue: service}
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ResetPasswordRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set things up', () => {
      component.ngOnInit();
      expect(component.id).toBeTruthy();
      expect(component.fg).toBeTruthy();
      expect(component.fg.get('password')).toBeTruthy();
    });
    it('should init the user and check for code', fakeAsync(() => {
      spyOn(component, 'onInitLoadUser').and.callThrough();
      spyOn(component, 'checkCode').and.callThrough();
      component.ngOnInit();
      expect(component.onInitLoadUser).toHaveBeenCalledWith();
      tick();
      expect(component.checkCode).toHaveBeenCalledWith();
    }));
    it('should clear the weak password err', fakeAsync(() => {
      component.ngOnInit();
      const fc = component.fg.get('password');
      fc.setValue('foo');
      fc.setErrors({'auth/weak-password': true});
      expect(fc.hasError('auth/weak-password')).toBe(true);
      fc.setValue('foob');
      tick();
      expect(fc.hasError('auth/weak-password')).toBe(false);
    }));
  });

  describe('checkCode', () => {
    it('should navigate and resolve with false if oobCode is not present', fakeAsync(() => {
      spyOn(component.service, 'navigate').and.callThrough();
      spyOn(component.service.auth, 'verifyPasswordResetCode').and.callThrough();
      component.route.snapshot.queryParams.mode = EzfaService.OUT_OF_BAND_MODES.resetPassword;
      let resolved;
      component.checkCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false);
      expect(component.service.navigate).toHaveBeenCalledWith();
      expect(component.service.auth.verifyPasswordResetCode).not.toHaveBeenCalled();
    }));
    it('should navigate and resolve with false if mode is not resetPassword', fakeAsync(() => {
      spyOn(component.service, 'navigate').and.callThrough();
      spyOn(component.service.auth, 'verifyPasswordResetCode').and.callThrough();
      component.route.snapshot.queryParams.mode = EzfaService.OUT_OF_BAND_MODES.verifyEmail;
      component.route.snapshot.queryParams.oobCode = '123';
      let resolved;
      component.checkCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false);
      expect(component.service.navigate).toHaveBeenCalledWith();
      expect(component.service.auth.verifyPasswordResetCode).not.toHaveBeenCalled();
    }));
    it('should call verifyPasswordResetCode and handle a valid code', fakeAsync(() => {
      spyOn(component.service, 'navigate').and.callThrough();
      spyOn(component.service.auth, 'verifyPasswordResetCode').and.callFake(() => Promise.resolve('foo@bar.com'));
      component.route.snapshot.queryParams.mode = EzfaService.OUT_OF_BAND_MODES.resetPassword;
      component.route.snapshot.queryParams.oobCode = '123';
      let resolved;
      component.checkCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.email).toBe('foo@bar.com');
      expect(component.screen).toBe('form');
      expect(component.service.navigate).not.toHaveBeenCalled();
    }));
    it('should call verifyPasswordResetCode and handle an error', fakeAsync(() => {
      spyOn(component.service, 'navigate').and.callThrough();
      spyOn(component.service.auth, 'verifyPasswordResetCode').and.callFake(() => Promise.reject({code: 'auth/other'}));
      component.route.snapshot.queryParams.mode = EzfaService.OUT_OF_BAND_MODES.resetPassword;
      component.route.snapshot.queryParams.oobCode = '123';
      let resolved;
      component.checkCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.screen).toBe('error');
      expect(component.error.code).toBe('auth/other');
      expect(component.service.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('submit', () => {
    let spyVerify;
    let spySignIn;
    let spyNavigate;
    beforeEach(() => {
      component.fg = component.fb.group({password: ['password']});
      component.oobCode = '123';
      component.email = 'foo@bar.com';
      component.screen = 'form';
      spyNavigate = spyOn(component.service, 'navigate').and.callThrough();
      spyVerify = spyOn(component.service.auth, 'confirmPasswordReset').and.callFake(() => Promise.resolve());
      spySignIn = spyOn(component.service.auth, 'signInWithEmailAndPassword').and.callFake(() => Promise.resolve(HELPER.MOCK_USER));
    });
    it('should work', fakeAsync(() => {
      component.submit();
      expect(component.screen).toBe('form');
      expect(component.submitting).toBe(true);
      expect(component.error).toBe(null);
      tick();
      expect(component.screen).toBe('success');
      expect(component.submitting).toBe(false);
      expect(spyVerify).toHaveBeenCalledWith('123', 'password');
      expect(spySignIn).toHaveBeenCalledWith('foo@bar.com', 'password');
      expect(spyNavigate).toHaveBeenCalledWith('account', {queryParams: {message: Messages.passwordReset}});
    }));

    it('should handle auth/weak-password', fakeAsync(() => {
      spyVerify.and.callFake(() => Promise.reject({code: 'auth/weak-password'}));
      component.submit();
      expect(component.screen).toBe('form');
      expect(component.submitting).toBe(true);
      expect(component.error).toBe(null);

      tick();
      expect(spyVerify).toHaveBeenCalledWith('123', 'password');
      expect(spySignIn).not.toHaveBeenCalled();
      expect(spyNavigate).not.toHaveBeenCalled();
      expect(component.fg.get('password').hasError('auth/weak-password')).toBe(true);
      expect(component.screen).toBe('form');
      expect(component.submitting).toBe(false);
      expect(component.error).toBe(null);

    }));

    it('should handle other errors -- set the error & show error screen', fakeAsync(() => {
      spyVerify.and.callFake(() => Promise.reject({code: 'auth/invalid-action-code'}));
      component.submit();
      expect(component.screen).toBe('form');
      expect(component.submitting).toBe(true);
      expect(component.error).toBe(null);
      tick();
      expect(spyVerify).toHaveBeenCalledWith('123', 'password');
      expect(spySignIn).not.toHaveBeenCalled();
      expect(spyNavigate).not.toHaveBeenCalled();
      expect(component.error.code).toBe('auth/invalid-action-code');
      expect(component.screen).toBe('error');
      expect(component.submitting).toBe(false);
    }));


  });
});
