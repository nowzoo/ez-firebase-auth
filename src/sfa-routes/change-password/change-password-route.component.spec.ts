import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as _ from 'lodash';
import { FormBuilder, FormControl} from '@angular/forms'

import { ChangePasswordRouteComponent } from './change-password-route.component';
import { SfaMessages } from '../messages.enum';
import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET
 } from '../test';


import { SfaService } from '../../sfa/sfa.service';

describe('ChangePasswordRouteComponent angular sanity check', () => {
  let component: ChangePasswordRouteComponent;
  let fixture: ComponentFixture<ChangePasswordRouteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ChangePasswordRouteComponent,
        ...MOCK_UTILITIES_DECLARATIONS
      ],
      imports: [ ...MOCK_IMPORTS ],
      providers: [
        ...MOCK_PROVIDERS
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

});

describe('ChangePasswordRouteComponent', () => {

  let component;
  let authState$: BehaviorSubject<any>;

  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    const sfaService: any = Object.assign({}, MOCK_AUTH_SERVICE_GET(), {
      authState: authState$.asObservable(),
      configuredProviderIds: ['password', 'twitter.com', 'facebook.com', 'google.com', 'github.com'],
      oAuthProviderIds: ['twitter.com', 'facebook.com', 'google.com', 'github.com']
    });
    const fb = new FormBuilder();
    component = new ChangePasswordRouteComponent(fb, sfaService);
  });

  describe('ngOnInit()', () => {
    it('should call onRoute', fakeAsync(() => {
      spyOn(component.authService, 'onRoute').and.callThrough();
      component.ngOnInit();
      expect(component.authService.onRoute).toHaveBeenCalledWith('change-password')
    }))
    it('should set the id', fakeAsync(() => {
      component.ngOnInit();
      expect(component.id).toBeTruthy()
    }))
    it('should set the fg', fakeAsync(() => {
      component.ngOnInit();
      expect(component.fg.get('password')).toBeTruthy()
    }))
    it('should gate to users with password', fakeAsync(() => {
      spyOn(component, 'onInitLoadUser').and.callThrough();
      spyOn(component, 'gateToUserWithPassword').and.callThrough();
      component.ngOnInit();
      expect(component.onInitLoadUser).toHaveBeenCalled();
      tick();
      expect(component.gateToUserWithPassword).toHaveBeenCalledWith();
    }))
    it('should clear the weak password err', fakeAsync(() => {
      authState$.next(MOCK_USER);
      component.ngOnInit();
      const fc = component.fg.get('password');
      fc.setValue('foo');
      fc.setErrors({'auth/weak-password': true})
      expect(fc.hasError('auth/weak-password')).toBe(true);
      fc.setValue('foob');
      tick();
      expect(fc.hasError('auth/weak-password')).toBe(false);
    }))

  })

  describe('submit()', () => {
    it('should return if there is no user', () => {
      expect(component.submitting).toBe(false);
      component.user = null;
      component.submit();
      expect(component.submitting).toBe(false);
    })
    it('should work', fakeAsync(() => {
      const user = Object.assign({}, MOCK_USER)
      authState$.next(user);
      component.ngOnInit();
      component.fg.get('password').setValue('jshkjsjks');
      tick();
      spyOn(component.user, 'updatePassword').and.callThrough();
      spyOn(component.authService, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updatePassword).toHaveBeenCalledWith('jshkjsjks')
      expect(component.authService.navigate).toHaveBeenCalledWith('account', {queryParams: {message: SfaMessages.passwordSaved}});
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
    }));

    it('should handle the auth/weak-password err', fakeAsync(() => {
      const user = Object.assign({}, MOCK_USER)
      authState$.next(user);
      component.ngOnInit();
      component.fg.get('password').setValue('shkjhskh');
      tick();
      spyOn(component.user, 'updatePassword').and.callFake(() => Promise.reject({code: 'auth/weak-password'}))
      spyOn(component.authService, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updatePassword).toHaveBeenCalledWith('shkjhskh')
      expect(component.authService.navigate).not.toHaveBeenCalled();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
      expect(component.fg.get('password').hasError('auth/weak-password')).toBe(true);
    }))


    it('should handle the requires-recent-login err', fakeAsync(() => {
      const user = Object.assign({}, MOCK_USER)
      authState$.next(user);
      component.ngOnInit();
      component.fg.get('password').setValue('jhheg');
      tick();
      spyOn(component.user, 'updatePassword').and.callFake(() => Promise.reject({code: 'auth/requires-recent-login'}))
      spyOn(component.authService, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updatePassword).toHaveBeenCalledWith('jhheg')
      expect(component.authService.navigate).toHaveBeenCalledWith('reauthenticate', {queryParams: {redirect: 'change-password'}});
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
    }))
    it('should handle other errors', fakeAsync(() => {
      const user = Object.assign({}, MOCK_USER)
      authState$.next(user);
      component.ngOnInit();
      component.fg.get('password').setValue('leieue');
      tick();
      spyOn(component.user, 'updatePassword').and.callFake(() => Promise.reject({code: 'auth/other'}))
      spyOn(component.authService, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updatePassword).toHaveBeenCalledWith('leieue')
      expect(component.authService.navigate).not.toHaveBeenCalled();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toEqual({code: 'auth/other'});
    }))
  })
});
