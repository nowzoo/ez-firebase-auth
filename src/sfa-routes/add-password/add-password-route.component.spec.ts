import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms'
import { MockComponent } from 'ng2-mock-component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AddPasswordRouteComponent } from './add-password-route.component';
import { SfaService } from '../../sfa/sfa.service';
import { OauthService } from '../oauth.service';
import * as Utils from '../../utils/utils';

describe('AddPasswordRouteComponent', () => {
  let component: AddPasswordRouteComponent;
  let fixture: ComponentFixture<AddPasswordRouteComponent>;

  const provider = {providerId: 'password'};
  const authState$: BehaviorSubject<any> = new BehaviorSubject(null);
  const user = {
    email: 'foo@bar.com',
    providerData: [{providerId: 'twitter.com'}],
    linkWithCredential: () => Promise.resolve()
  }
  const authService = {
    authState: authState$.asObservable(),
    onRoute: () => {},
    navigate: () => {},
    getProviderById: () => Promise.resolve(provider)
  };
  const oAuthService = {};

  let getProviderByIdSpy;
  let linkWithCredentialSpy;

  beforeEach(() => {
    getProviderByIdSpy = spyOn(authService, 'getProviderById').and.callThrough();
    linkWithCredentialSpy = spyOn(user, 'linkWithCredential').and.callThrough();
    spyOn(authService, 'navigate').and.callThrough();
    spyOn(authService, 'onRoute').and.callThrough();
    TestBed.configureTestingModule({
      imports : [ReactiveFormsModule],
      declarations: [
        AddPasswordRouteComponent,
        MockComponent({ selector: 'sfa-toggleable-password', inputs: ['control'] }),
        MockComponent({ selector: '[sfaInvalidInput]', inputs: ['sfaInvalidInput'] }),
        MockComponent({ selector: '[sfaInvalidFeedback]', inputs: ['sfaInvalidFeedback', 'key'] })
     ],
     providers: [
       {provide: SfaService, useValue: authService},
       {provide: OauthService, useValue: oAuthService}
     ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(AddPasswordRouteComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should set things up', () => {
      component.ngOnInit();
      expect(component.id).toBeTruthy();
      expect(component.fg.get('password')).toBeTruthy();
      expect(authService.onRoute).toHaveBeenCalledWith('add-password');
    })
    it('should redirect to sign in if there is no user', fakeAsync(() => {
      authState$.next(null);
      component.ngOnInit();
      tick();
      expect(authService.navigate).toHaveBeenCalledWith('sign-in')
    }))
    it('should redirect to account if the user has a password', fakeAsync(() => {
      authState$.next({providerData: [{providerId: 'password'}]});
      component.ngOnInit();
      tick();
      expect(authService.navigate).toHaveBeenCalledWith('account')
    }))
    it('should not redirect to account if the user has a password', fakeAsync(() => {
      authState$.next(user);
      component.ngOnInit();
      tick();
      expect(authService.navigate).not.toHaveBeenCalled()
    }))

    it('should clear the weak password error when the input changes', fakeAsync(() => {
      authState$.next(user);
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
  describe('ngOnDestroy()', () => {
    it('should deal with unsubscribing from the control', fakeAsync(() => {
      let unsub = false;
      component.ngUnsubscribe.subscribe(_ => unsub = true);
      component.ngOnDestroy();
      expect(unsub).toBe(true)
    }))
  })

  describe('addPassword(user, password)', () => {
    it('should resolve', fakeAsync(() => {
      let resolved;
      component.addPassword(user, 'foobar').then(result => resolved = true);
      tick();
      expect(resolved).toBe(true)
    }))
    it('should reject if getProviderById fails', fakeAsync(() => {
      let rejected;
      getProviderByIdSpy.and.callFake(() => {
        console.log('he')
        return Promise.reject({code: 'getProviderById err'});
      });
      component.addPassword(user, 'foobar').catch(result => rejected = result);
      tick();
      expect(rejected.code).toBe('getProviderById err')
    }))
    it('should reject if linkWithCredential fails', fakeAsync(() => {
      let rejected;
      linkWithCredentialSpy.and.callFake(() => {
        return Promise.reject({code: 'linkWithCredential err'});
      });
      component.addPassword(user, 'foobar').catch(result => rejected = result);
      tick();
      expect(rejected.code).toBe('linkWithCredential err')
    }))

  });

  describe('submit()', () => {
    it('should resolve successfully', fakeAsync(() => {
      spyOn(component, 'addPassword').and.callFake(() => {
        return Promise.resolve(user);
      });
      authState$.next(user);
      component.ngOnInit();
      component.fg.setValue({password: 'foobar'});
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      expect(component.addPassword).toHaveBeenCalledWith(user, 'foobar');
      tick();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
      expect(authService.navigate).toHaveBeenCalledWith('account')
    }));

    it('should handle auth/weak-password error', fakeAsync(() => {
      spyOn(component, 'addPassword').and.callFake(() => {
        return Promise.reject({code: 'auth/weak-password'});
      });
      authState$.next(user);
      component.ngOnInit();
      component.fg.setValue({password: 'foobar'});
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      expect(component.addPassword).toHaveBeenCalledWith(user, 'foobar');
      tick();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
      expect(component.fg.get('password').hasError('auth/weak-password')).toBe(true)
    }));
    it('should handle auth/requires-recent-login error', fakeAsync(() => {
      spyOn(component, 'addPassword').and.callFake(() => {
        return Promise.reject({code: 'auth/requires-recent-login'});
      });
      authState$.next(user);
      component.ngOnInit();
      component.fg.setValue({password: 'foobar'});
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      expect(component.addPassword).toHaveBeenCalledWith(user, 'foobar');
      tick();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
      expect(authService.navigate).toHaveBeenCalledWith('reauthenticate', {queryParams: {redirect: 'add-password'}});
    }));
    it('should handle other errors', fakeAsync(() => {
      spyOn(component, 'addPassword').and.callFake(() => {
        return Promise.reject({code: 'auth/other'});
      });
      authState$.next(user);
      component.ngOnInit();
      component.fg.setValue({password: 'foobar'});
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      expect(component.addPassword).toHaveBeenCalledWith(user, 'foobar');
      tick();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toEqual({code: 'auth/other'});
    }));
  })


});
