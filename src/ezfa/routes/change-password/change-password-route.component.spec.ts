import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as _ from 'lodash';
import { FormBuilder, FormControl} from '@angular/forms';

import { ChangePasswordRouteComponent } from './change-password-route.component';
import { Messages } from '../messages.enum';

import { EzfaService } from '../../ezfa.service';

import * as HELPER from '../../test';



describe('ChangePasswordRouteComponent angular sanity check', () => {
  let component: ChangePasswordRouteComponent;
  let fixture: ComponentFixture<ChangePasswordRouteComponent>;
  let service;
  let authState$: BehaviorSubject<any>;

  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    service = HELPER.getMockService(authState$);
    TestBed.configureTestingModule({
      declarations: [
        ChangePasswordRouteComponent,
        ...HELPER.MOCK_UTILITIES_DECLARATIONS
      ],
      imports: [ ...HELPER.MOCK_IMPORTS ],
      providers: [
        {provide: EzfaService, useValue: service},
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ChangePasswordRouteComponent);
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
      expect(component.service.onRouteChange).toHaveBeenCalledWith('change-password');
    }));
    it('should set the id', fakeAsync(() => {
      component.ngOnInit();
      expect(component.id).toBeTruthy();
    }));
    it('should set the fg', fakeAsync(() => {
      component.ngOnInit();
      expect(component.fg.get('password')).toBeTruthy();
    }));
    it('should gate to users with password', fakeAsync(() => {
      spyOn(component, 'onInitLoadUser').and.callThrough();
      spyOn(component, 'gateToUserWithPassword').and.callThrough();
      component.ngOnInit();
      expect(component.onInitLoadUser).toHaveBeenCalled();
      tick();
      expect(component.gateToUserWithPassword).toHaveBeenCalledWith();
    }));
    it('should clear the weak password err', fakeAsync(() => {
      authState$.next(HELPER.MOCK_USER);
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
      component.fg.get('password').setValue('jshkjsjks');
      tick();
      spyOn(component.user, 'updatePassword').and.callThrough();
      spyOn(component.service, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updatePassword).toHaveBeenCalledWith('jshkjsjks');
      expect(component.service.navigate).toHaveBeenCalledWith('account', {queryParams: {message: Messages.passwordSaved}});
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
    }));

    it('should handle the auth/weak-password err', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER);
      authState$.next(user);
      component.ngOnInit();
      component.fg.get('password').setValue('shkjhskh');
      tick();
      spyOn(component.user, 'updatePassword').and.callFake(() => Promise.reject({code: 'auth/weak-password'}));
      spyOn(component.service, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updatePassword).toHaveBeenCalledWith('shkjhskh');
      expect(component.service.navigate).not.toHaveBeenCalled();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
      expect(component.fg.get('password').hasError('auth/weak-password')).toBe(true);
    }));


    it('should handle the requires-recent-login err', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER);
      authState$.next(user);
      component.ngOnInit();
      component.fg.get('password').setValue('jhheg');
      tick();
      spyOn(component.user, 'updatePassword').and.callFake(() => Promise.reject({code: 'auth/requires-recent-login'}));
      spyOn(component.service, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updatePassword).toHaveBeenCalledWith('jhheg');
      expect(component.service.navigate).toHaveBeenCalledWith('reauthenticate', {queryParams: {redirect: 'change-password'}});
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
    }));
    it('should handle other errors', fakeAsync(() => {
      const user = Object.assign({}, HELPER.MOCK_USER);
      authState$.next(user);
      component.ngOnInit();
      component.fg.get('password').setValue('leieue');
      tick();
      spyOn(component.user, 'updatePassword').and.callFake(() => Promise.reject({code: 'auth/other'}));
      spyOn(component.service, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updatePassword).toHaveBeenCalledWith('leieue');
      expect(component.service.navigate).not.toHaveBeenCalled();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toEqual({code: 'auth/other'});
    }));
  });

});
