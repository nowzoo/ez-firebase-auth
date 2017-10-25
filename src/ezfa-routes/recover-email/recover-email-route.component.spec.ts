import {  ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { OUT_OF_BAND_MODES } from '../routes';

import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET
 } from '../../test';

 import { RecoverEmailRouteComponent } from './recover-email-route.component';

describe('RecoverEmailRouteComponent angular sanity check', () => {
  let component: RecoverEmailRouteComponent;
  let fixture: ComponentFixture<RecoverEmailRouteComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...MOCK_IMPORTS],
      declarations: [
        RecoverEmailRouteComponent, ...MOCK_UTILITIES_DECLARATIONS
       ],
      providers: [
        ...MOCK_PROVIDERS
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
});
describe('RecoverEmailRouteComponent', () => {
  let component;
  let authState$: BehaviorSubject<any>;

  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    const sfaService: any = Object.assign({}, MOCK_AUTH_SERVICE_GET(), {
      authState: authState$.asObservable(),
      configuredProviderIds: ['password', 'twitter.com', 'facebook.com', 'google.com', 'github.com'],
      oAuthProviderIds: ['twitter.com', 'facebook.com', 'google.com', 'github.com']
    });
    const route: any = Object.assign({}, MOCK_ROUTE_GET());
    route.snapshot.queryParams.providerId = 'twitter.com';
    component = new RecoverEmailRouteComponent(route, sfaService);
  });

  describe('ngOnInit', () => {
    it('should make the right calls', fakeAsync(() => {
      spyOn(component.authService, 'onRoute').and.callThrough();
      spyOn(component, 'onInitLoadUser').and.callThrough();
      spyOn(component, 'checkForCode').and.callThrough();
      component.ngOnInit();
      expect(component.authService.onRoute).toHaveBeenCalledWith('recover-email');
      expect(component.onInitLoadUser).toHaveBeenCalledWith();
      tick();
      expect(component.checkForCode).toHaveBeenCalledWith();
    }));
  })
  describe('submit', () => {
    it('should handle success', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      spyOn(component.authService.auth, 'applyActionCode').and.callFake(() => Promise.resolve());
      component.oobCode = '123';
      component.submit();
      expect(component.authService.auth.applyActionCode).toHaveBeenCalledWith('123');
      expect(component.screen).not.toBe('success');
      tick();
      expect(component.screen).toBe('success');
    }))
    it('should handle failure', fakeAsync(() => {
      spyOn(component.authService.auth, 'applyActionCode').and.callFake(() => Promise.reject({code: 'auth/other'}));
      component.oobCode = '123';
      component.submit();
      expect(component.authService.auth.applyActionCode).toHaveBeenCalledWith('123');
      expect(component.screen).not.toBe('success');
      tick();
      expect(component.screen).toBe('error');
    }))
  })

  describe('checkForCode', () => {
    it('should navigate and resolve with false if oobCode is not present', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      spyOn(component.authService.auth, 'checkActionCode').and.callThrough();
      component.route.snapshot.queryParams.mode = OUT_OF_BAND_MODES.recoverEmail;
      let resolved;
      component.checkForCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false)
      expect(component.authService.navigate).toHaveBeenCalledWith();
      expect(component.authService.auth.checkActionCode).not.toHaveBeenCalled();
    }))
    it('should navigate and resolve with false if mode is not recoverEmail', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      spyOn(component.authService.auth, 'checkActionCode').and.callThrough();
      component.route.snapshot.queryParams.mode = OUT_OF_BAND_MODES.resetPassword;
      component.route.snapshot.queryParams.oobCode = '123';
      let resolved;
      component.checkForCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false)
      expect(component.authService.navigate).toHaveBeenCalledWith();
      expect(component.authService.auth.checkActionCode).not.toHaveBeenCalled();
    }))
    it('should handle success', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      spyOn(component.authService.auth, 'checkActionCode').and.callFake(() => Promise.resolve({foo: 'bar'}));
      component.route.snapshot.queryParams.mode = OUT_OF_BAND_MODES.recoverEmail;
      component.route.snapshot.queryParams.oobCode = '123';
      let resolved;
      expect(component.actionCodeInfo).toBe(null);
      component.checkForCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true)
      expect(component.authService.navigate).not.toHaveBeenCalled();
      expect(component.authService.auth.checkActionCode).toHaveBeenCalledWith('123');
      expect(component.actionCodeInfo).toEqual({foo: 'bar'});
      expect(component.error).toBe(null);
      expect(component.screen).toBe('form');


    }))
    it('should handle failure', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      spyOn(component.authService.auth, 'checkActionCode').and.callFake(() => Promise.reject({code: 'auth/other'}));
      component.route.snapshot.queryParams.mode = OUT_OF_BAND_MODES.recoverEmail;
      component.route.snapshot.queryParams.oobCode = '123';
      let resolved;
      expect(component.actionCodeInfo).toBe(null);
      component.checkForCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true)
      expect(component.authService.navigate).not.toHaveBeenCalled();
      expect(component.authService.auth.checkActionCode).toHaveBeenCalledWith('123');
      expect(component.actionCodeInfo).toBe(null);
      expect(component.error).toEqual({code: 'auth/other'})
      expect(component.screen).toBe('error');

    }))
  })

})
