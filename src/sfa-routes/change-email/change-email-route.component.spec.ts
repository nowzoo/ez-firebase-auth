import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { MockComponent } from 'ng2-mock-component';
import * as _ from '../../utils/lodash-funcs';

import { ChangeEmailRouteComponent } from './change-email-route.component';
import { SfaMessages } from '../messages.enum';


import { SfaService } from '../../sfa/sfa.service';

describe('ChangeEmailRouteComponent', () => {
  let component: ChangeEmailRouteComponent;
  let fixture: ComponentFixture<ChangeEmailRouteComponent>;


  const user = {
    email: 'foo@bar.com',
    providerData: [{providerId: 'password'}],
    updateEmail: () => Promise.resolve(),
    reload: () => Promise.resolve(),
    sendEmailVerification: () => Promise.resolve(),
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
        ChangeEmailRouteComponent,
        MockComponent({ selector: '[sfaInvalidInput]', inputs: ['sfaInvalidInput'] }),
        MockComponent({ selector: '[sfaInvalidFeedback]', inputs: ['sfaInvalidFeedback', 'key'] })
      ],
      imports: [ ReactiveFormsModule ],
      providers: [
        {provide: SfaService, useValue: authService}
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ChangeEmailRouteComponent);
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
      expect(component.authService.onRoute).toHaveBeenCalledWith('change-email')
    }))
    it('should set the id', fakeAsync(() => {
      component.ngOnInit();
      expect(component.id).toBeTruthy()
    }))
    it('should set the fg', fakeAsync(() => {
      component.ngOnInit();
      expect(component.fg.get('email')).toBeTruthy()
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

    it('should clear the invalid email err', fakeAsync(() => {
      authState$.next(user);
      component.ngOnInit();
      const fc = component.fg.get('email');
      fc.setValue('foo');
      fc.setErrors({'auth/invalid-email': true})
      expect(fc.hasError('auth/invalid-email')).toBe(true);
      fc.setValue('foob');
      tick();
      expect(fc.hasError('auth/invalid-email')).toBe(false);
    }))
    it('should clear the email-already-in-use err', fakeAsync(() => {
      authState$.next(user);
      component.ngOnInit();
      const fc = component.fg.get('email');
      fc.setValue('foo');
      fc.setErrors({'auth/email-already-in-use': true})
      expect(fc.hasError('auth/email-already-in-use')).toBe(true);
      fc.setValue('foob');
      tick();
      expect(fc.hasError('auth/email-already-in-use')).toBe(false);
    }))
    it('should set an error if the fc value = the user\'s current email', fakeAsync(() => {
      authState$.next(user);
      component.ngOnInit();
      const fc = component.fg.get('email');
      fc.setValue(user.email);
      tick();
      expect(fc.hasError('same')).toBe(true);
      fc.setValue('a@b.com');
      tick();
      expect(fc.hasError('same')).toBe(false);
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
      component.fg.get('email').setValue('a@b.co');
      component.authService.sendEmailVerificationLink = true;
      tick();
      spyOn(component.user, 'updateEmail').and.callThrough();
      spyOn(component.user, 'sendEmailVerification').and.callThrough();
      spyOn(component.authService, 'onEmailChanged').and.callThrough();
      spyOn(component.authService, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updateEmail).toHaveBeenCalledWith('a@b.co')
      expect(component.user.sendEmailVerification).toHaveBeenCalledWith()
      expect(component.authService.onEmailChanged).toHaveBeenCalledWith({user: user, newEmail: 'a@b.co', oldEmail: 'foo@bar.com'})
      expect(component.authService.navigate).toHaveBeenCalledWith('account', {queryParams: {message: SfaMessages.emailSaved}});
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
    }));
    it('should work if sendEmailVerificationLink is false', fakeAsync(() => {
      component.ngOnInit();
      component.fg.get('email').setValue('a@b.co');
      component.authService.sendEmailVerificationLink = false;
      tick();
      spyOn(component.user, 'updateEmail').and.callThrough();
      spyOn(component.user, 'sendEmailVerification').and.callThrough();
      spyOn(component.authService, 'onEmailChanged').and.callThrough();
      spyOn(component.authService, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updateEmail).toHaveBeenCalledWith('a@b.co')
      expect(component.user.sendEmailVerification).not.toHaveBeenCalled()
      expect(component.authService.onEmailChanged).toHaveBeenCalledWith({user: user, newEmail: 'a@b.co', oldEmail: 'foo@bar.com'})
      expect(component.authService.navigate).toHaveBeenCalledWith('account', {queryParams: {message: SfaMessages.emailSaved}});
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
    }));

    it('should handle the invalid-email err', fakeAsync(() => {
      component.ngOnInit();
      component.fg.get('email').setValue('a@b.co');
      component.authService.sendEmailVerificationLink = true;
      tick();
      spyOn(component.user, 'updateEmail').and.callFake(() => Promise.reject({code: 'auth/invalid-email'}))
      spyOn(component.user, 'sendEmailVerification').and.callThrough();
      spyOn(component.authService, 'onEmailChanged').and.callThrough();
      spyOn(component.authService, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updateEmail).toHaveBeenCalledWith('a@b.co')
      expect(component.user.sendEmailVerification).not.toHaveBeenCalled()
      expect(component.authService.onEmailChanged).not.toHaveBeenCalled()
      expect(component.authService.navigate).not.toHaveBeenCalled();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
      expect(component.fg.get('email').hasError('auth/invalid-email')).toBe(true);
    }))

    it('should handle the email-already-in-use err', fakeAsync(() => {
      component.ngOnInit();
      component.fg.get('email').setValue('a@b.co');
      component.authService.sendEmailVerificationLink = true;
      tick();
      spyOn(component.user, 'updateEmail').and.callFake(() => Promise.reject({code: 'auth/email-already-in-use'}))
      spyOn(component.user, 'sendEmailVerification').and.callThrough();
      spyOn(component.authService, 'onEmailChanged').and.callThrough();
      spyOn(component.authService, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updateEmail).toHaveBeenCalledWith('a@b.co')
      expect(component.user.sendEmailVerification).not.toHaveBeenCalled()
      expect(component.authService.onEmailChanged).not.toHaveBeenCalled()
      expect(component.authService.navigate).not.toHaveBeenCalled();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
      expect(component.fg.get('email').hasError('auth/email-already-in-use')).toBe(true);
    }))

    it('should handle the requires-recent-login err', fakeAsync(() => {
      component.ngOnInit();
      component.fg.get('email').setValue('a@b.co');
      component.authService.sendEmailVerificationLink = true;
      tick();
      spyOn(component.user, 'updateEmail').and.callFake(() => Promise.reject({code: 'auth/requires-recent-login'}))
      spyOn(component.user, 'sendEmailVerification').and.callThrough();
      spyOn(component.authService, 'onEmailChanged').and.callThrough();
      spyOn(component.authService, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updateEmail).toHaveBeenCalledWith('a@b.co')
      expect(component.user.sendEmailVerification).not.toHaveBeenCalled()
      expect(component.authService.onEmailChanged).not.toHaveBeenCalled()
      expect(component.authService.navigate).toHaveBeenCalledWith('reauthenticate', {queryParams: {redirect: 'change-email'}});
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toBe(null);
    }))
    it('should handle other errors', fakeAsync(() => {
      component.ngOnInit();
      component.fg.get('email').setValue('a@b.co');
      component.authService.sendEmailVerificationLink = true;
      tick();
      spyOn(component.user, 'updateEmail').and.callFake(() => Promise.reject({code: 'auth/other'}))
      spyOn(component.user, 'sendEmailVerification').and.callThrough();
      spyOn(component.authService, 'onEmailChanged').and.callThrough();
      spyOn(component.authService, 'navigate').and.callThrough();
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.user.updateEmail).toHaveBeenCalledWith('a@b.co')
      expect(component.user.sendEmailVerification).not.toHaveBeenCalled()
      expect(component.authService.onEmailChanged).not.toHaveBeenCalled()
      expect(component.authService.navigate).not.toHaveBeenCalled();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError).toEqual({code: 'auth/other'});
    }))
  })
});
