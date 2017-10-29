import {  ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as HELPER from '../../test';
import { EzfaService } from '../../ezfa.service';

import { RecoverEmailRouteComponent } from './recover-email-route.component';

describe('RecoverEmailRouteComponent angular sanity check', () => {
  let component: RecoverEmailRouteComponent;
  let fixture: ComponentFixture<RecoverEmailRouteComponent>;

  let authState$: BehaviorSubject<any>;
  let service;
  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    service = HELPER.getMockService(authState$);
    TestBed.configureTestingModule({
      imports: [...HELPER.MOCK_IMPORTS],
      declarations: [
        RecoverEmailRouteComponent, ...HELPER.MOCK_UTILITIES_DECLARATIONS
       ],
      providers: [
          {provide: EzfaService, useValue: service},
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(RecoverEmailRouteComponent);
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
      expect(component.service.onRouteChange).toHaveBeenCalledWith('recover-email');
      expect(component.onInitLoadUser).toHaveBeenCalledWith();
      tick();
      expect(component.checkCode).toHaveBeenCalledWith();
    }));
  });
  describe('submit', () => {
    it('should handle success', fakeAsync(() => {
      spyOn(component.service, 'navigate').and.callThrough();
      spyOn(component.service.auth, 'applyActionCode').and.callFake(() => Promise.resolve());
      component.oobCode = '123';
      component.submit();
      expect(component.service.auth.applyActionCode).toHaveBeenCalledWith('123');
      expect(component.screen).not.toBe('success');
      tick();
      expect(component.screen).toBe('success');
    }));
    it('should handle failure', fakeAsync(() => {
      spyOn(component.service.auth, 'applyActionCode').and.callFake(() => Promise.reject({code: 'auth/other'}));
      component.oobCode = '123';
      component.submit();
      expect(component.service.auth.applyActionCode).toHaveBeenCalledWith('123');
      expect(component.screen).not.toBe('success');
      tick();
      expect(component.screen).toBe('error');
    }));
  });

  describe('checkCode', () => {
    it('should navigate and resolve with false if oobCode is not present', fakeAsync(() => {
      spyOn(component.service, 'navigate').and.callThrough();
      spyOn(component.service.auth, 'checkActionCode').and.callThrough();
      component.route.snapshot.queryParams.mode = EzfaService.OUT_OF_BAND_MODES.recoverEmail;
      let resolved;
      component.checkCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false);
      expect(component.service.navigate).toHaveBeenCalledWith();
      expect(component.service.auth.checkActionCode).not.toHaveBeenCalled();
    }));
    it('should navigate and resolve with false if mode is not recoverEmail', fakeAsync(() => {
      spyOn(component.service, 'navigate').and.callThrough();
      spyOn(component.service.auth, 'checkActionCode').and.callThrough();
      component.route.snapshot.queryParams.mode = EzfaService.OUT_OF_BAND_MODES.resetPassword;
      component.route.snapshot.queryParams.oobCode = '123';
      let resolved;
      component.checkCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false);
      expect(component.service.navigate).toHaveBeenCalledWith();
      expect(component.service.auth.checkActionCode).not.toHaveBeenCalled();
    }));
    it('should handle success', fakeAsync(() => {
      spyOn(component.service, 'navigate').and.callThrough();
      spyOn(component.service.auth, 'checkActionCode').and.callFake(() => Promise.resolve({foo: 'bar'}));
      component.route.snapshot.queryParams.mode = EzfaService.OUT_OF_BAND_MODES.recoverEmail;
      component.route.snapshot.queryParams.oobCode = '123';
      let resolved;
      expect(component.actionCodeInfo).toBe(null);
      component.checkCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.service.navigate).not.toHaveBeenCalled();
      expect(component.service.auth.checkActionCode).toHaveBeenCalledWith('123');
      expect(component.actionCodeInfo).toEqual({foo: 'bar'});
      expect(component.error).toBe(null);
      expect(component.screen).toBe('form');


    }));
    it('should handle failure', fakeAsync(() => {
      spyOn(component.service, 'navigate').and.callThrough();
      spyOn(component.service.auth, 'checkActionCode').and.callFake(() => Promise.reject({code: 'auth/other'}));
      component.route.snapshot.queryParams.mode = EzfaService.OUT_OF_BAND_MODES.recoverEmail;
      component.route.snapshot.queryParams.oobCode = '123';
      let resolved;
      expect(component.actionCodeInfo).toBe(null);
      component.checkCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.service.navigate).not.toHaveBeenCalled();
      expect(component.service.auth.checkActionCode).toHaveBeenCalledWith('123');
      expect(component.actionCodeInfo).toBe(null);
      expect(component.error).toEqual({code: 'auth/other'});
      expect(component.screen).toBe('error');

    }));
  });
});
