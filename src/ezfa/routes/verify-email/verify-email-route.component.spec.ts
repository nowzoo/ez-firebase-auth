import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as HELPER from '../../test';
import { EzfaService } from '../../ezfa.service';
import { Messages } from '../messages.enum';


import { VerifyEmailRouteComponent } from './verify-email-route.component';

describe('VerifyEmailRouteComponent angular sanity check', () => {
  let component: VerifyEmailRouteComponent;
  let fixture: ComponentFixture<VerifyEmailRouteComponent>;
  let authState$: BehaviorSubject<any>;
  let service;

  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    service = HELPER.getMockService(authState$);

    TestBed.configureTestingModule({
      declarations: [ VerifyEmailRouteComponent, ...HELPER.MOCK_UTILITIES_DECLARATIONS ],
      imports: [...HELPER.MOCK_IMPORTS],
      providers: [
        {provide: EzfaService, useValue: service}
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(VerifyEmailRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should make the right calls', fakeAsync(() => {
      spyOn(component.service, 'onRouteChange').and.callThrough();
      spyOn(component, 'onInitLoadUser').and.callThrough();
      spyOn(component, 'checkCode').and.callThrough();
      component.ngOnInit();
      expect(component.service.onRouteChange).toHaveBeenCalledWith('verify-email');
      expect(component.onInitLoadUser).toHaveBeenCalledWith();
      tick();
      expect(component.checkCode).toHaveBeenCalledWith();
    }));
  });

  describe('checkCode', () => {
    let spyNavigate;
    let spyCheck;
    let spyApply;
    let resolved;
    beforeEach(() => {
      spyNavigate = spyOn(component.service, 'navigate').and.callThrough();
      spyCheck = spyOn(component.service.auth, 'checkActionCode').and.callThrough();
      spyApply = spyOn(component.service.auth, 'applyActionCode').and.callThrough();
      resolved = undefined;
    });
    it('should navigate and resolve with false if oobCode is not present', fakeAsync(() => {
      component.route.snapshot.queryParams.mode = EzfaService.OUT_OF_BAND_MODES.verifyEmail;
      component.checkCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false);
      expect(spyNavigate).toHaveBeenCalledWith();
      expect(spyCheck).not.toHaveBeenCalled();
    }));
    it('should navigate and resolve with false if mode is not verifyEmail', fakeAsync(() => {
      component.route.snapshot.queryParams.mode = EzfaService.OUT_OF_BAND_MODES.resetPassword;
      component.route.snapshot.queryParams.oobCode = '123';
      component.checkCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false);
      expect(spyNavigate).toHaveBeenCalledWith();
      expect(spyCheck).not.toHaveBeenCalled();
    }));
    it('should handle success', fakeAsync(() => {
      spyCheck.and.callFake(() => Promise.resolve({data: {email: 'foo@bar.com'}}));
      spyApply.and.callFake(() => Promise.resolve());
      component.route.snapshot.queryParams.mode = EzfaService.OUT_OF_BAND_MODES.verifyEmail;
      component.route.snapshot.queryParams.oobCode = '123';
      expect(component.email).toBe(null);
      component.checkCode().then(result => resolved = result);
      tick();
      expect(component.email).toBe('foo@bar.com');
      expect(resolved).toBe(true);
      expect(component.service.navigate).toHaveBeenCalledWith(null, {queryParams: {
        email: component.email,
        message: Messages.emailVerified }});
      expect(component.service.auth.checkActionCode).toHaveBeenCalledWith('123');
      expect(component.service.auth.applyActionCode).toHaveBeenCalledWith('123');
      expect(component.error).toBe(null);
      expect(component.screen).toBe('success');
    }));
    it('should handle failure of checkActionCode', fakeAsync(() => {
      spyCheck.and.callFake(() => Promise.reject({code: 'auth/other'}));
      component.route.snapshot.queryParams.mode = EzfaService.OUT_OF_BAND_MODES.verifyEmail;
      component.route.snapshot.queryParams.oobCode = '123';
      expect(component.email).toBe(null);
      component.checkCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.service.navigate).not.toHaveBeenCalled();
      expect(component.service.auth.checkActionCode).toHaveBeenCalledWith('123');
      expect(component.email).toBe(null);
      expect(component.error).toEqual({code: 'auth/other'});
      expect(component.screen).toBe('error');
    }));
    it('should handle failure of applyActionCode', fakeAsync(() => {
      spyCheck.and.callFake(() => Promise.resolve({data: {email: 'foo@bar.com'}}));
      spyApply.and.callFake(() => Promise.reject({code: 'auth/other'}));
      component.route.snapshot.queryParams.mode = EzfaService.OUT_OF_BAND_MODES.verifyEmail;
      component.route.snapshot.queryParams.oobCode = '123';
      expect(component.email).toBe(null);
      component.checkCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.service.navigate).not.toHaveBeenCalled();
      expect(component.service.auth.checkActionCode).toHaveBeenCalledWith('123');
      expect(component.email).toBe('foo@bar.com');
      expect(component.error).toEqual({code: 'auth/other'});
      expect(component.screen).toBe('error');
    }));
  });
});
