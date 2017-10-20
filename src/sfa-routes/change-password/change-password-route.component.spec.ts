import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { MockComponent } from 'ng2-mock-component';
import * as _ from '../../utils/lodash-funcs';

import { ChangePasswordRouteComponent } from './change-password-route.component';
import { SfaMessages } from '../messages.enum';


import { SfaService } from '../../sfa/sfa.service';

describe('ChangePasswordRouteComponent', () => {
  let component: ChangePasswordRouteComponent;
  let fixture: ComponentFixture<ChangePasswordRouteComponent>;


  const user = {
    email: 'foo@bar.com',
    providerData: [{providerId: 'password'}],
    updatePassword: () => Promise.resolve(),
    reload: () => Promise.resolve(),
  }
  const authState$: BehaviorSubject<any> = new BehaviorSubject(user);
  const authService = {
    authState: authState$.asObservable(),
    onRoute: () => {},
    onEmailChanged: () => {},
    navigate: () => {},
    configuredProviderIds: ['password']
  };



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ChangePasswordRouteComponent,
        MockComponent({ selector: '[sfaInvalidInput]', inputs: ['sfaInvalidInput'] }),
        MockComponent({ selector: '[sfaInvalidFeedback]', inputs: ['sfaInvalidFeedback', 'key'] }),
        MockComponent({ selector: 'sfa-toggleable-password', inputs: ['control'] }),
      ],
      imports: [ ReactiveFormsModule ],
      providers: [
        {provide: SfaService, useValue: authService}
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ChangePasswordRouteComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnDestroy()', () => {
    it('should deal with unsubscribing', fakeAsync(() => {
      let unsub = false;
      component.ngUnsubscribe.subscribe(_ => unsub = true);
      component.ngOnDestroy();
      expect(unsub).toBe(true)
    }))
  })

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
    it('should redirect to sign in if the user is null', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      component.ngOnInit();
      authState$.next(null);
      tick();
      expect(component.authService.navigate).toHaveBeenCalledWith('sign-in');
    }))
    it('should redirect to account if the user does not have a password', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      const anotherUser = _.assign({}, user);
      anotherUser.providerData = [{providerId: 'twitter.com'}];
      component.ngOnInit();
      authState$.next(anotherUser);
      tick();
      expect(component.authService.navigate).toHaveBeenCalledWith('account');
    }))
    it('should not redirect if the user has password', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      authState$.next(user);
      expect(authState$.value.providerData[0].providerId).toBe('password');
      component.ngOnInit();
      tick();
      expect(component.authService.navigate).not.toHaveBeenCalled();
    }))
    it('should redirect to account if the password provider is not enabled', fakeAsync(() => {
      spyOn(component.authService, 'navigate').and.callThrough();
      authState$.next(user);
      component.authService.configuredProviderIds = ['twitter.com'];
      component.ngOnInit();
      tick();
      expect(component.authService.navigate).toHaveBeenCalledWith('account');
    }))
    it('should redirect to account if the password provider is not enabled', fakeAsync(() => {
      expect(component.authService.configuredProviderIds).toEqual(['password'])
    }))

    it('should clear the weak password err', fakeAsync(() => {
      authState$.next(user);
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
