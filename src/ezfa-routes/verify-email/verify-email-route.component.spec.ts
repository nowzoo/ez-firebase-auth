import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { OUT_OF_BAND_MODES } from '../routes';
import { SfaMessages } from '../messages.enum';

import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET
 } from '../../test';

import { VerifyEmailRouteComponent } from './verify-email-route.component';

describe('VerifyEmailRouteComponent angular sanity check', () => {
  let component: VerifyEmailRouteComponent;
  let fixture: ComponentFixture<VerifyEmailRouteComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyEmailRouteComponent, ...MOCK_UTILITIES_DECLARATIONS ],
      imports: [...MOCK_IMPORTS],
      providers: [
        MOCK_PROVIDERS
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
});

describe('VerifyEmailRouteComponent', () => {
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
    component = new VerifyEmailRouteComponent(route, sfaService);
  });

  describe('ngOnInit', () => {
    it('should make the right calls', fakeAsync(() => {
      spyOn(component.authService, 'onRoute').and.callThrough();
      spyOn(component, 'onInitLoadUser').and.callThrough();
      spyOn(component, 'checkForCode').and.callThrough();
      component.ngOnInit();
      expect(component.authService.onRoute).toHaveBeenCalledWith('verify-email');
      expect(component.onInitLoadUser).toHaveBeenCalledWith();
      tick();
      expect(component.checkForCode).toHaveBeenCalledWith();
    }));
  })

  describe('checkForCode', () => {
    let spyNavigate;
    let spyCheck;
    let spyApply;
    let resolved;
    beforeEach(() => {
      spyNavigate = spyOn(component.authService, 'navigate').and.callThrough();
      spyCheck = spyOn(component.authService.auth, 'checkActionCode').and.callThrough();
      spyApply = spyOn(component.authService.auth, 'applyActionCode').and.callThrough();
      resolved = undefined;
    })
    it('should navigate and resolve with false if oobCode is not present', fakeAsync(() => {
      component.route.snapshot.queryParams.mode = OUT_OF_BAND_MODES.verifyEmail;
      component.checkForCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false)
      expect(spyNavigate).toHaveBeenCalledWith();
      expect(spyCheck).not.toHaveBeenCalled();
    }))
    it('should navigate and resolve with false if mode is not verifyEmail', fakeAsync(() => {
      component.route.snapshot.queryParams.mode = OUT_OF_BAND_MODES.resetPassword;
      component.route.snapshot.queryParams.oobCode = '123';
      component.checkForCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false)
      expect(spyNavigate).toHaveBeenCalledWith();
      expect(spyCheck).not.toHaveBeenCalled();
    }))
    it('should handle success', fakeAsync(() => {
      spyCheck.and.callFake(() => Promise.resolve({data: {email: 'foo@bar.com'}}));
      spyApply.and.callFake(() => Promise.resolve());
      component.route.snapshot.queryParams.mode = OUT_OF_BAND_MODES.verifyEmail;
      component.route.snapshot.queryParams.oobCode = '123';
      expect(component.email).toBe(null);
      component.checkForCode().then(result => resolved = result);
      tick();
      expect(component.email).toBe('foo@bar.com')
      expect(resolved).toBe(true)
      expect(component.authService.navigate).toHaveBeenCalledWith(null, {queryParams: {
        email: component.email,
        message: SfaMessages.emailVerified }});
      expect(component.authService.auth.checkActionCode).toHaveBeenCalledWith('123');
      expect(component.authService.auth.applyActionCode).toHaveBeenCalledWith('123');
      expect(component.error).toBe(null);
      expect(component.screen).toBe('success');
    }))
    it('should handle failure of checkActionCode', fakeAsync(() => {
      spyCheck.and.callFake(() => Promise.reject({code: 'auth/other'}));
      component.route.snapshot.queryParams.mode = OUT_OF_BAND_MODES.verifyEmail;
      component.route.snapshot.queryParams.oobCode = '123';
      expect(component.email).toBe(null);
      component.checkForCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true)
      expect(component.authService.navigate).not.toHaveBeenCalled();
      expect(component.authService.auth.checkActionCode).toHaveBeenCalledWith('123');
      expect(component.email).toBe(null);
      expect(component.error).toEqual({code: 'auth/other'})
      expect(component.screen).toBe('error');
    }))
    it('should handle failure of applyActionCode', fakeAsync(() => {
      spyCheck.and.callFake(() => Promise.resolve({data: {email: 'foo@bar.com'}}));
      spyApply.and.callFake(() => Promise.reject({code: 'auth/other'}));
      component.route.snapshot.queryParams.mode = OUT_OF_BAND_MODES.verifyEmail;
      component.route.snapshot.queryParams.oobCode = '123';
      expect(component.email).toBe(null);
      component.checkForCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true)
      expect(component.authService.navigate).not.toHaveBeenCalled();
      expect(component.authService.auth.checkActionCode).toHaveBeenCalledWith('123');
      expect(component.email).toBe('foo@bar.com');
      expect(component.error).toEqual({code: 'auth/other'})
      expect(component.screen).toBe('error');
    }))
  })
})
