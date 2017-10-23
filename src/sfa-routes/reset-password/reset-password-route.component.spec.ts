import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { OUT_OF_BAND_MODES } from '../sfa-routes';
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

import { ResetPasswordRouteComponent } from './reset-password-route.component';

describe('ResetPasswordRouteComponent angular sanity check', () => {
  let component: ResetPasswordRouteComponent;
  let fixture: ComponentFixture<ResetPasswordRouteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...MOCK_IMPORTS],
      declarations: [
        ResetPasswordRouteComponent,
        ...MOCK_UTILITIES_DECLARATIONS
      ],
      providers: [
        ...MOCK_PROVIDERS
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
});

describe('ResetPasswordRouteComponent', () => {
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
    const fb = new FormBuilder();
    component = new ResetPasswordRouteComponent(route, fb, sfaService);
  });

  describe('ngOnInit', () => {
    it('should set things up', () => {
      component.ngOnInit();
      expect(component.id).toBeTruthy();
      expect(component.fg).toBeTruthy();
      expect(component.fg.get('password')).toBeTruthy();
    })
    it('should init the user and check for code', fakeAsync(() => {
      spyOn(component, 'onInitLoadUser').and.callThrough();
      spyOn(component, 'checkForCode').and.callThrough();
      component.ngOnInit();
      expect(component.onInitLoadUser).toHaveBeenCalledWith();
      tick();
      expect(component.checkForCode).toHaveBeenCalledWith();
    }))
    it('should clear the weak password err', fakeAsync(() => {
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

  describe('checkForCode', () => {
    it('should navigate and resolve with false if oobCode is not present', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      spyOn(component.authService.auth, 'verifyPasswordResetCode').and.callThrough();
      component.route.snapshot.queryParams.mode = OUT_OF_BAND_MODES.resetPassword;
      let resolved;
      component.checkForCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false)
      expect(component.authService.navigate).toHaveBeenCalledWith();
      expect(component.authService.auth.verifyPasswordResetCode).not.toHaveBeenCalled();
    }))
    it('should navigate and resolve with false if mode is not resetPassword', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      spyOn(component.authService.auth, 'verifyPasswordResetCode').and.callThrough();
      component.route.snapshot.queryParams.mode = OUT_OF_BAND_MODES.verifyEmail;
      component.route.snapshot.queryParams.oobCode = '123';
      let resolved;
      component.checkForCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false)
      expect(component.authService.navigate).toHaveBeenCalledWith();
      expect(component.authService.auth.verifyPasswordResetCode).not.toHaveBeenCalled();
    }))
    it('should call verifyPasswordResetCode and handle a valid code', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      spyOn(component.authService.auth, 'verifyPasswordResetCode').and.callFake(() => Promise.resolve('foo@bar.com'))
      component.route.snapshot.queryParams.mode = OUT_OF_BAND_MODES.resetPassword;
      component.route.snapshot.queryParams.oobCode = '123';
      let resolved;
      component.checkForCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.email).toBe('foo@bar.com');
      expect(component.screen).toBe('form');
      expect(component.authService.navigate).not.toHaveBeenCalled();
    }))
    it('should call verifyPasswordResetCode and handle an error', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      spyOn(component.authService.auth, 'verifyPasswordResetCode').and.callFake(() => Promise.reject({code: 'auth/other'}))
      component.route.snapshot.queryParams.mode = OUT_OF_BAND_MODES.resetPassword;
      component.route.snapshot.queryParams.oobCode = '123';
      let resolved;
      component.checkForCode().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.screen).toBe('error');
      expect(component.error.code).toBe('auth/other');
      expect(component.authService.navigate).not.toHaveBeenCalled();
    }))
  })

  describe('submit', () => {
    let spyVerify;
    let spySignIn;
    let spyNavigate;
    beforeEach(() => {
      component.fg = component.fb.group({password: ['password']})
      component.oobCode = '123';
      component.email = 'foo@bar.com';
      component.screen = 'form';
      spyNavigate = spyOn(component.authService, 'navigate').and.callThrough()
      spyVerify = spyOn(component.authService.auth, 'confirmPasswordReset').and.callFake(() => Promise.resolve());
      spySignIn = spyOn(component.authService.auth, 'signInWithEmailAndPassword').and.callFake(() => Promise.resolve(MOCK_USER))
    })
    it('should work', fakeAsync(() => {
      component.submit();
      expect(component.screen).toBe('form');
      expect(component.submitting).toBe(true);
      expect(component.error).toBe(null);
      tick();
      expect(component.screen).toBe('success');
      expect(component.submitting).toBe(false);
      expect(spyVerify).toHaveBeenCalledWith('123', 'password')
      expect(spySignIn).toHaveBeenCalledWith('foo@bar.com', 'password');
      expect(spyNavigate).toHaveBeenCalledWith('account', {queryParams: {message: SfaMessages.passwordReset}})
    }))

    it('should handle auth/weak-password', fakeAsync(() => {
      spyVerify.and.callFake(() => Promise.reject({code: 'auth/weak-password'}))
      component.submit();
      expect(component.screen).toBe('form');
      expect(component.submitting).toBe(true);
      expect(component.error).toBe(null);

      tick();
      expect(spyVerify).toHaveBeenCalledWith('123', 'password')
      expect(spySignIn).not.toHaveBeenCalled();
      expect(spyNavigate).not.toHaveBeenCalled();
      expect(component.fg.get('password').hasError('auth/weak-password')).toBe(true)
      expect(component.screen).toBe('form')
      expect(component.submitting).toBe(false);
      expect(component.error).toBe(null);

    }))

    it('should handle other errors -- set the error & show error screen', fakeAsync(() => {
      spyVerify.and.callFake(() => Promise.reject({code: 'auth/invalid-action-code'}))
      component.submit();
      expect(component.screen).toBe('form');
      expect(component.submitting).toBe(true);
      expect(component.error).toBe(null);
      tick();
      expect(spyVerify).toHaveBeenCalledWith('123', 'password')
      expect(spySignIn).not.toHaveBeenCalled();
      expect(spyNavigate).not.toHaveBeenCalled();
      expect(component.error.code).toBe('auth/invalid-action-code')
      expect(component.screen).toBe('error')
      expect(component.submitting).toBe(false);
    }))


  })
})
