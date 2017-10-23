import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { OauthService } from '../oauth.service';
import * as Utils from '../../utils/utils';

import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET
 } from '../test';

 import { AddPasswordRouteComponent } from './add-password-route.component';

describe('AddPasswordRouteComponent angular sanity check', () => {
  let component: AddPasswordRouteComponent;
  let fixture: ComponentFixture<AddPasswordRouteComponent>;


  beforeEach(() => {

    TestBed.configureTestingModule({
      imports : [
          ...MOCK_IMPORTS
      ],
      declarations: [
        AddPasswordRouteComponent,
        ...MOCK_UTILITIES_DECLARATIONS
     ],
     providers: [
       ...MOCK_PROVIDERS
     ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(AddPasswordRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

});

describe('AddPasswordRouteComponent', () => {

  let component;
  let authState$: BehaviorSubject<any>;
  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    const sfaService: any = Object.assign({}, MOCK_AUTH_SERVICE_GET(), {
      authState: authState$.asObservable(),
      configuredProviderIds: ['password']
    });
    const fb = new FormBuilder();
    component = new AddPasswordRouteComponent(fb, sfaService);
  });

  describe('ngOnInit()', () => {
    it('should set things up', fakeAsync(() => {
      authState$.next(MOCK_USER);
      spyOn(component.authService, 'onRoute').and.callThrough();
      spyOn(component, 'onInitLoadUser').and.callThrough();
      spyOn(component, 'gateToUserWithNoPassword').and.callThrough();
      component.ngOnInit();
      expect(component.id).toBeTruthy();
      expect(component.fg.get('password')).toBeTruthy();
      expect(component.authService.onRoute).toHaveBeenCalledWith('add-password');
      expect(component.onInitLoadUser).toHaveBeenCalledWith();
      tick();
      expect(component.gateToUserWithNoPassword).toHaveBeenCalledWith();
    }));


    it('should clear the weak password error when the input changes', fakeAsync(() => {
      authState$.next(MOCK_USER);
      component.ngOnInit();
      tick();
      const fc = component.fg.get('password');
      expect(fc.hasError('auth/weak-password')).toBe(false);
      fc.setValue('123');
      fc.setErrors({'auth/weak-password': true});
      expect(fc.hasError('auth/weak-password')).toBe(true);
      fc.setValue('123 a strong password');
      tick();
      expect(fc.hasError('auth/weak-password')).toBe(false);
    }))
  })

  describe('addPassword(user, password)', () => {
    it('should resolve', fakeAsync(() => {
      let resolved;
      const user = Object.assign({}, MOCK_USER);
      spyOn(user, 'linkWithCredential').and.callFake(() => Promise.resolve(MOCK_USER))
      spyOn(component.authService, 'getProviderById').and.callFake(() => Promise.resolve({providerId: 'password'}))
      component.addPassword(user, 'foobar').then(result => resolved = true);
      tick();
      expect(resolved).toBe(true)
    }))
    it('should reject if getProviderById fails', fakeAsync(() => {
      let rejected;
      const user = Object.assign({}, MOCK_USER);
      spyOn(user, 'linkWithCredential').and.callThrough();
      spyOn(component.authService, 'getProviderById').and.callFake(() => Promise.reject({code: 'getProviderById err'}))
      component.addPassword(user, 'foobar').catch(result => rejected = result);
      tick();
      expect(rejected.code).toBe('getProviderById err')
    }))
    it('should reject if linkWithCredential fails', fakeAsync(() => {
      let rejected;
      const user = Object.assign({}, MOCK_USER);
      spyOn(user, 'linkWithCredential').and.callFake(() => Promise.reject({code: 'linkWithCredential err'}))
      spyOn(component.authService, 'getProviderById').and.callFake(() => Promise.resolve({providerId: 'password'}))
      component.addPassword(user, 'foobar').catch(result => rejected = result);
      tick();
      expect(rejected.code).toBe('linkWithCredential err')
    }))

  });

  describe('submit()', () => {
    it('should resolve successfully', fakeAsync(() => {
      spyOn(component, 'addPassword').and.callFake(() => Promise.resolve(MOCK_USER));
      spyOn(component.authService, 'navigate').and.callThrough()
      authState$.next(MOCK_USER);
      component.ngOnInit();
      component.fg.setValue({password: 'foobar'});
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      expect(component.addPassword).toHaveBeenCalledWith(MOCK_USER, 'foobar');
      tick();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
      expect(component.authService.navigate).toHaveBeenCalledWith('account')
    }));

    it('should handle auth/weak-password error', fakeAsync(() => {
      spyOn(component, 'addPassword').and.callFake(() => Promise.reject({code: 'auth/weak-password'}));
      authState$.next(MOCK_USER);
      component.ngOnInit();
      component.fg.setValue({password: 'foobar'});
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      expect(component.addPassword).toHaveBeenCalledWith(MOCK_USER, 'foobar');
      tick();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
      expect(component.fg.get('password').hasError('auth/weak-password')).toBe(true)
    }));
    it('should handle auth/requires-recent-login error', fakeAsync(() => {
      spyOn(component, 'addPassword').and.callFake(() =>  Promise.reject({code: 'auth/requires-recent-login'}));
      spyOn(component.authService, 'navigate').and.callThrough()
      authState$.next(MOCK_USER);
      component.ngOnInit();
      component.fg.setValue({password: 'foobar'});
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      expect(component.addPassword).toHaveBeenCalledWith(MOCK_USER, 'foobar');
      tick();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
      expect(component.authService.navigate).toHaveBeenCalledWith('reauthenticate', {queryParams: {redirect: 'add-password'}});
    }));
    it('should handle other errors', fakeAsync(() => {
      spyOn(component, 'addPassword').and.callFake(() => Promise.reject({code: 'auth/other'}));
      authState$.next(MOCK_USER);
      component.ngOnInit();
      component.fg.setValue({password: 'foobar'});
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      expect(component.addPassword).toHaveBeenCalledWith(MOCK_USER, 'foobar');
      tick();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toEqual({code: 'auth/other'});
    }));
  })


});
