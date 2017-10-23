import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FormBuilder } from '@angular/forms';
import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET
 } from '../test';


import { SendResetPasswordLinkRouteComponent } from './send-reset-password-link-route.component';


describe('SendResetPasswordLinkRouteComponent angular sanity check', () => {
  let component: SendResetPasswordLinkRouteComponent;
  let fixture: ComponentFixture<SendResetPasswordLinkRouteComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...MOCK_IMPORTS],
      declarations: [
        SendResetPasswordLinkRouteComponent,
        ...MOCK_UTILITIES_DECLARATIONS
      ],
      providers: [
        ...MOCK_PROVIDERS
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(SendResetPasswordLinkRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

describe('SendResetPasswordLinkRouteComponent', () => {
  let component;
  let authState$: BehaviorSubject<any>;
  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    const sfaService: any = Object.assign({}, MOCK_AUTH_SERVICE_GET(), {
      authState: authState$.asObservable(),
      configuredProviderIds: ['password', 'twitter.com', 'facebook.com', 'google.com', 'github.com'],
      oAuthProviderIds: ['twitter.com', 'facebook.com', 'google.com', 'github.com']
    });
    const route: any = MOCK_ROUTE_GET();
    const fb = new FormBuilder();
    component = new SendResetPasswordLinkRouteComponent(route, fb, sfaService);
  });

  describe('ngOnInit', () => {
    it('should load the user, then set the fg value if the user is present', fakeAsync(() => {
      authState$.next(MOCK_USER);
      spyOn(component, 'onInitLoadUser').and.callThrough();
      component.ngOnInit();
      tick();
      expect(component.fg.get('email').value).toBe(MOCK_USER.email);
    }))
    it('should load the user, then set the fg value to the qp.email, even if if the user is present', fakeAsync(() => {
      authState$.next(MOCK_USER);
      component.route.snapshot.queryParams.email = 'a@b.co'
      spyOn(component, 'onInitLoadUser').and.callThrough();
      component.ngOnInit();
      tick();
      expect(component.fg.get('email').value).toBe('a@b.co');
    }))
    it('should load the user, then set the fg value to "", if there is no user and no query param', fakeAsync(() => {
      authState$.next(null);
      delete component.route.snapshot.queryParams.email;
      spyOn(component, 'onInitLoadUser').and.callThrough();
      component.ngOnInit();
      tick();
      expect(component.fg.get('email').value).toBe('');
    }))
    it('should set things up', () => {
      component.ngOnInit();
      expect(component.id).toBeTruthy();
      expect(component.fg.get('email')).toBeTruthy();
    });
    it('should clear the invalid email err', fakeAsync(() => {
      component.ngOnInit();
      const fc = component.fg.get('email');
      fc.setValue('foo');
      fc.setErrors({'auth/invalid-email': true})
      expect(fc.hasError('auth/invalid-email')).toBe(true);
      fc.setValue('foob');
      tick();
      expect(fc.hasError('auth/invalid-email')).toBe(false);
    }))
    it('should clear the auth/user-not-found err', fakeAsync(() => {
      component.ngOnInit();
      const fc = component.fg.get('email');
      fc.setValue('foo');
      fc.setErrors({'auth/user-not-found': true})
      expect(fc.hasError('auth/user-not-found')).toBe(true);
      fc.setValue('foob');
      tick();
      expect(fc.hasError('auth/user-not-found')).toBe(false);
    }))
    it('should clear the sfa/no-password err', fakeAsync(() => {
      component.ngOnInit();
      const fc = component.fg.get('email');
      fc.setValue('foo');
      fc.setErrors({'sfa/no-password': true})
      expect(fc.hasError('sfa/no-password')).toBe(true);
      fc.setValue('foob');
      tick();
      expect(fc.hasError('sfa/no-password')).toBe(false);
    }))
  })
  describe('submit()', () => {
    let spyEnsure;
    let spySend;
    beforeEach(() => {
      spyEnsure = spyOn(component, 'ensureUserExistsWithPassword').and.callThrough();
      spySend = spyOn(component.authService.auth, 'sendPasswordResetEmail').and.callThrough();
      component.fg = component.fb.group({email: ['foo@bar.com']});
      component.success = false;
      component.submitting = false;
    })
    it('should handle success', fakeAsync(() => {
      spyEnsure.and.callFake(() => Promise.resolve());
      spySend.and.callFake(() => Promise.resolve());
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.ensureUserExistsWithPassword).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(component.authService.auth.sendPasswordResetEmail).toHaveBeenCalledWith('foo@bar.com');
      expect(component.submitting).toBe(false);
      expect(component.success).toBe(true);
    }))
    it('should handled sfa/no-password', fakeAsync(() => {
      spyEnsure.and.callFake(() => Promise.reject({code: 'sfa/no-password'}));
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.ensureUserExistsWithPassword).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(component.authService.auth.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(component.submitting).toBe(false);
      expect(component.success).toBe(false);
      expect(component.unhandledError).toBe(null);
      expect(component.fg.get('email').hasError('sfa/no-password')).toBe(true);
    }))
    it('should handled auth/user-not-found', fakeAsync(() => {
      spyEnsure.and.callFake(() => Promise.reject({code: 'auth/user-not-found'}));
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.ensureUserExistsWithPassword).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(component.authService.auth.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(component.submitting).toBe(false);
      expect(component.success).toBe(false);
      expect(component.unhandledError).toBe(null);
      expect(component.fg.get('email').hasError('auth/user-not-found')).toBe(true);
    }))
    it('should handled auth/invalid-email', fakeAsync(() => {
      spyEnsure.and.callFake(() => Promise.resolve());
      spySend.and.callFake(() => Promise.reject({code: 'auth/invalid-email'}))
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.ensureUserExistsWithPassword).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(component.authService.auth.sendPasswordResetEmail).toHaveBeenCalledWith('foo@bar.com');
      expect(component.submitting).toBe(false);
      expect(component.success).toBe(false);
      expect(component.unhandledError).toBe(null);
      expect(component.fg.get('email').hasError('auth/invalid-email')).toBe(true);
    }))
    it('should handled other errors', fakeAsync(() => {
      spyEnsure.and.callFake(() => Promise.resolve());
      spySend.and.callFake(() => Promise.reject({code: 'auth/other'}))
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.ensureUserExistsWithPassword).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(component.authService.auth.sendPasswordResetEmail).toHaveBeenCalledWith('foo@bar.com');
      expect(component.submitting).toBe(false);
      expect(component.success).toBe(false);
      expect(component.unhandledError).toEqual({code: 'auth/other'});
      expect(component.fg.get('email').errors).toBe(null)
    }))
  })
  describe('ensureUserExistsWithPassword(email: string)', () => {
    let spyFetch;
    let result;
    beforeEach(() => {
      spyFetch = spyOn(component.authService.auth, 'fetchProvidersForEmail').and.callThrough();
      result = undefined;
    })

    it('should resolve if the user has a password', fakeAsync(() => {
      spyFetch.and.callFake(() => Promise.resolve(['password']));
      component.ensureUserExistsWithPassword('foo@bar.com').then(_ => result = true);
      expect(spyFetch).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(result).toBe(true);
    }))
    it('should reject if the user does not exist', fakeAsync(() => {
      spyFetch.and.callFake(() => Promise.resolve([]));
      component.ensureUserExistsWithPassword('foo@bar.com').catch(e => result = e);
      expect(spyFetch).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(result).toEqual({code: 'auth/user-not-found'});
    }))
    it('should reject if the user does not have a password', fakeAsync(() => {
      spyFetch.and.callFake(() => Promise.resolve(['twitter.com']));
      component.ensureUserExistsWithPassword('foo@bar.com').catch(e => result = e);
      expect(spyFetch).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(result).toEqual({code: 'sfa/no-password'});
    }))
  })

  describe('reset()', () => {
    it('should set success to false', () => {
      component.success = true;
      component.reset();
      expect(component.success).toBe(false);
    })
  })
});
