import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { Router, NavigationExtras } from '@angular/router';
import { SfaService } from '../sfa/sfa.service';
import 'rxjs/add/operator/take';
import {
  SfaOptions, OAuthMethod,
  SfaProviderLabels, LOCAL_PERSISTENCE_DISABLED_STORAGE_KEY,
  IAuthUserEvent,
  IAuthEmailChangedEvent
} from '../sfa/sfa';
import {AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';

import { EmailSignInService } from './email-sign-in.service';




describe('SfaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EmailSignInService,
        {provide: SfaService, useValue: {options: {configuredProviderIds: []}, auth: {}}}
      ]
    });
  });

  it('should be created', () => {
    const service: EmailSignInService = TestBed.get(EmailSignInService);
    expect(service).toBeTruthy();
  });

  describe('emailHasPasswordProvider()', () => {
    describe('when the email has oauth providers but no password', () => {
      const auth = {fetchProvidersForEmail: (email: string) => {
        return Promise.resolve(['twitter.com'])
      }};
      beforeEach(() => {
        spyOn(auth, 'fetchProvidersForEmail').and.callThrough();
        TestBed.overrideProvider(SfaService, {useValue: {auth: auth}});
      });
      it('should reject with an error', fakeAsync(() => {
        const service: EmailSignInService = TestBed.get(EmailSignInService);
        let code: string;
        service.emailHasPasswordProvider('foo@bar.co').catch((err: firebase.FirebaseError) => code = err.code);
        tick();
        expect(auth.fetchProvidersForEmail).toHaveBeenCalledWith('foo@bar.co');
        expect(code).toBe('sfa/no-password-for-email');
      }))
    })
    describe('when the email has no providers', () => {
      const auth = {fetchProvidersForEmail: (email: string) => {
        return Promise.resolve([])
      }};
      beforeEach(() => {
        spyOn(auth, 'fetchProvidersForEmail').and.callThrough();
        TestBed.overrideProvider(SfaService, {useValue: {auth: auth}});
      });
      it('should resolve with false because the email does not yet have any providers', fakeAsync(() => {
        const service: EmailSignInService = TestBed.get(EmailSignInService);
        let resolve: any = null;
        service.emailHasPasswordProvider('foo@bar.co').then((result: boolean) => resolve = result);
        tick();
        expect(auth.fetchProvidersForEmail).toHaveBeenCalledWith('foo@bar.co');
        expect(resolve).toBe(false);
      }))
    })
    describe('when the email has a password provider', () => {
      const auth = {fetchProvidersForEmail: (email: string) => {
        return Promise.resolve(['twitter.com', 'password'])
      }};
      beforeEach(() => {
        spyOn(auth, 'fetchProvidersForEmail').and.callThrough();
        TestBed.overrideProvider(SfaService, {useValue: {auth: auth}});
      });
      it('should resolve with true because the email has the password provider', fakeAsync(() => {
        const service: EmailSignInService = TestBed.get(EmailSignInService);
        let resolve: any = null;
        service.emailHasPasswordProvider('foo@bar.co').then((result: boolean) => resolve = result);
        tick();
        expect(auth.fetchProvidersForEmail).toHaveBeenCalledWith('foo@bar.co');
        expect(resolve).toBe(true);
      }))
    })
    describe('when the underlying api call fails', () => {
      const auth = {fetchProvidersForEmail: (email: string) => {
        return Promise.reject({code: 'auth/unexpected'})
      }};
      beforeEach(() => {
        spyOn(auth, 'fetchProvidersForEmail').and.callThrough();
        TestBed.overrideProvider(SfaService, {useValue: {auth: auth}});
      });
      it('should reject with the firebase error', fakeAsync(() => {
        const service: EmailSignInService = TestBed.get(EmailSignInService);
        let code: string = null;
        service.emailHasPasswordProvider('foo@bar.co').catch((err: firebase.FirebaseError) => code = err.code);
        tick();
        expect(auth.fetchProvidersForEmail).toHaveBeenCalledWith('foo@bar.co');
        expect(code).toBe('auth/unexpected');
      }))
    })
  })

  describe('emailSignIn()', () => {
    const user = {
      uid: 'ff',
      displayName: 'gsgfgsf',
      updateProfile: () => {
        return Promise.resolve();
      },
      sendEmailVerification: () => {
        return Promise.resolve();
      },
      reload: () => {
        return Promise.resolve();
      }
    };
    const auth = {
      createUserWithEmailAndPassword: () => {
        return Promise.resolve();
      },
      signInWithEmailAndPassword: () => {
        return Promise.resolve(user);
      },

    }
    const sfaService = {
      getProviderById: () => {
        return Promise.resolve({providerId: 'password'});
      },
      auth: auth,
      onSignedIn: () => {},
      requireDisplayName: true,
      sendEmailVerificationLink: true
    }

    beforeEach(() => {
      TestBed.overrideProvider(SfaService, {useValue: sfaService});
    });

    describe('when the password provider has not been configured', () => {
      it('should reject with the error', fakeAsync(() => {
        const service: EmailSignInService = TestBed.get(EmailSignInService);
        let code: string = null;
        spyOn(sfaService, 'getProviderById').and.returnValue(Promise.reject({code: 'sfa/provider-not-configured'}));
        service.emailSignIn('foo@bar.co', 'password').catch((err: firebase.FirebaseError) => code = err.code);
        tick();
        expect(sfaService.getProviderById).toHaveBeenCalledWith('password');
        expect(code).toBe('sfa/provider-not-configured');
      }))
    })

    describe('when the emailhas oauth accounts but no password', () => {
      it('should reject with the error', fakeAsync(() => {
        const service: EmailSignInService = TestBed.get(EmailSignInService);
        spyOn(service, 'emailHasPasswordProvider').and.returnValue(Promise.reject({code: 'sfa/no-password-for-email'}));
        let code: string = null;
        service.emailSignIn('foo@bar.co', 'password').catch((err: firebase.FirebaseError) => code = err.code);
        tick();
        expect(service.emailHasPasswordProvider).toHaveBeenCalledWith('foo@bar.co');
        expect(code).toBe('sfa/no-password-for-email');
      }))
    })

    describe('when the underlying api createUserWithEmailAndPassword call fails', () => {
      it('should reject with the error', fakeAsync(() => {
        const service: EmailSignInService = TestBed.get(EmailSignInService);
        spyOn(service, 'emailHasPasswordProvider').and.returnValue(Promise.resolve(false));
        spyOn(auth, 'createUserWithEmailAndPassword').and.returnValue(Promise.reject({code: 'auth/unexpected'}));
        let code: string = null;
        service.emailSignIn('foo@bar.co', 'password', 'New User').catch((err: firebase.FirebaseError) => code = err.code);
        tick();
        expect(service.emailHasPasswordProvider).toHaveBeenCalledWith('foo@bar.co');
        expect(auth.createUserWithEmailAndPassword).toHaveBeenCalledWith('foo@bar.co', 'password');
        expect(code).toBe('auth/unexpected');
      }))
    })
    describe('when the underlying api signInWithEmailAndPassword call fails', () => {
      it('should reject with the error', fakeAsync(() => {
        const service: EmailSignInService = TestBed.get(EmailSignInService);
        spyOn(service, 'emailHasPasswordProvider').and.returnValue(Promise.resolve(false));
        spyOn(auth, 'signInWithEmailAndPassword').and.returnValue(Promise.reject({code: 'auth/unexpected'}));
        let code: string = null;
        service.emailSignIn('foo@bar.co', 'password', 'New User').catch((err: firebase.FirebaseError) => code = err.code);
        tick();
        expect(service.emailHasPasswordProvider).toHaveBeenCalledWith('foo@bar.co');
        expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith('foo@bar.co', 'password');
        expect(code).toBe('auth/unexpected');
      }))
    })
    describe('when the underlying api updateProfile call fails', () => {
      it('should reject with the error', fakeAsync(() => {
        const service: EmailSignInService = TestBed.get(EmailSignInService);
        sfaService.requireDisplayName = true;
        spyOn(service, 'emailHasPasswordProvider').and.returnValue(Promise.resolve(false));
        spyOn(user, 'updateProfile').and.returnValue(Promise.reject({code: 'auth/unexpected'}));
        let code: string = null;
        service.emailSignIn('foo@bar.co', 'password', 'New User').catch((err: firebase.FirebaseError) => code = err.code);
        tick();
        expect(service.emailHasPasswordProvider).toHaveBeenCalledWith('foo@bar.co');
        expect(user.updateProfile).toHaveBeenCalledWith({displayName: 'New User', photoURL: null});
        expect(code).toBe('auth/unexpected');
      }))
    })
    describe('when the underlying api sendEmailVerification call fails', () => {
      it('should reject with the error', fakeAsync(() => {
        const service: EmailSignInService = TestBed.get(EmailSignInService);
        sfaService.sendEmailVerificationLink = true;
        spyOn(service, 'emailHasPasswordProvider').and.returnValue(Promise.resolve(false));
        spyOn(user, 'sendEmailVerification').and.returnValue(Promise.reject({code: 'auth/unexpected'}));
        let code: string = null;
        service.emailSignIn('foo@bar.co', 'password', 'New User').catch((err: firebase.FirebaseError) => code = err.code);
        tick();
        expect(service.emailHasPasswordProvider).toHaveBeenCalledWith('foo@bar.co');
        expect(user.sendEmailVerification).toHaveBeenCalledWith();
        expect(code).toBe('auth/unexpected');
      }))
    })

    it('should resolve with the user if it is a new account', fakeAsync(() => {
      const service: EmailSignInService = TestBed.get(EmailSignInService);
      let presult: any;
      sfaService.sendEmailVerificationLink = true;
      sfaService.requireDisplayName = true;
      spyOn(service, 'emailHasPasswordProvider').and.returnValue(Promise.resolve(false));
      spyOn(user, 'updateProfile').and.callThrough();
      spyOn(user, 'sendEmailVerification').and.callThrough();
      spyOn(user, 'reload').and.callThrough();
      spyOn(auth, 'createUserWithEmailAndPassword').and.callThrough();
      spyOn(auth, 'signInWithEmailAndPassword').and.callThrough();
      spyOn(sfaService, 'onSignedIn').and.callThrough();
      service.emailSignIn('foo@bar.co', 'password', 'New User').then((result: any) => presult = result);
      tick();
      expect(service.emailHasPasswordProvider).toHaveBeenCalledWith('foo@bar.co');
      expect(user.updateProfile).toHaveBeenCalledWith({displayName: 'New User', photoURL: null});
      expect(user.sendEmailVerification).toHaveBeenCalledWith();
      expect(user.reload).toHaveBeenCalledWith();
      expect(auth.createUserWithEmailAndPassword).toHaveBeenCalledWith('foo@bar.co', 'password');
      expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith('foo@bar.co', 'password');
      expect(sfaService.onSignedIn).toHaveBeenCalledWith({user: presult, providerId: 'password'});
      expect(presult).toBe(user);
    }));
    it('should resolve with the user if it is a new account and we do not requireDisplayName', fakeAsync(() => {
      const service: EmailSignInService = TestBed.get(EmailSignInService);
      let presult: any;
      sfaService.sendEmailVerificationLink = true;
      sfaService.requireDisplayName = false;
      spyOn(service, 'emailHasPasswordProvider').and.returnValue(Promise.resolve(false));
      spyOn(user, 'updateProfile').and.callThrough();
      spyOn(user, 'sendEmailVerification').and.callThrough();
      spyOn(user, 'reload').and.callThrough();
      spyOn(auth, 'createUserWithEmailAndPassword').and.callThrough();
      spyOn(auth, 'signInWithEmailAndPassword').and.callThrough();
      spyOn(sfaService, 'onSignedIn').and.callThrough();
      service.emailSignIn('foo@bar.co', 'password', 'New User').then((result: any) => presult = result);
      tick();
      expect(service.emailHasPasswordProvider).toHaveBeenCalledWith('foo@bar.co');
      expect(user.updateProfile).not.toHaveBeenCalled();
      expect(user.sendEmailVerification).toHaveBeenCalledWith();
      expect(user.reload).toHaveBeenCalledWith();
      expect(auth.createUserWithEmailAndPassword).toHaveBeenCalledWith('foo@bar.co', 'password');
      expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith('foo@bar.co', 'password');
      expect(sfaService.onSignedIn).toHaveBeenCalledWith({user: presult, providerId: 'password'});
      expect(presult).toBe(user);
    }));
    it('should resolve with the user if it is a new account and we do not sendEmailVerificationLink', fakeAsync(() => {
      const service: EmailSignInService = TestBed.get(EmailSignInService);
      let presult: any;
      sfaService.sendEmailVerificationLink = false;
      sfaService.requireDisplayName = false;
      spyOn(service, 'emailHasPasswordProvider').and.returnValue(Promise.resolve(false));
      spyOn(user, 'updateProfile').and.callThrough();
      spyOn(user, 'sendEmailVerification').and.callThrough();
      spyOn(user, 'reload').and.callThrough();
      spyOn(auth, 'createUserWithEmailAndPassword').and.callThrough();
      spyOn(auth, 'signInWithEmailAndPassword').and.callThrough();
      spyOn(sfaService, 'onSignedIn').and.callThrough();
      service.emailSignIn('foo@bar.co', 'password', 'New User').then((result: any) => presult = result);
      tick();
      expect(service.emailHasPasswordProvider).toHaveBeenCalledWith('foo@bar.co');
      expect(user.updateProfile).not.toHaveBeenCalled();
      expect(user.sendEmailVerification).not.toHaveBeenCalled();
      expect(user.reload).toHaveBeenCalledWith();
      expect(auth.createUserWithEmailAndPassword).toHaveBeenCalledWith('foo@bar.co', 'password');
      expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith('foo@bar.co', 'password');
      expect(sfaService.onSignedIn).toHaveBeenCalledWith({user: presult, providerId: 'password'});
      expect(presult).toBe(user);
    }));
    it('should resolve with the user if it is an existing account', fakeAsync(() => {
      const service: EmailSignInService = TestBed.get(EmailSignInService);
      let presult: any;
      sfaService.sendEmailVerificationLink = true;
      sfaService.requireDisplayName = true;
      spyOn(service, 'emailHasPasswordProvider').and.returnValue(Promise.resolve(true));
      spyOn(user, 'updateProfile').and.callThrough();
      spyOn(user, 'sendEmailVerification').and.callThrough();
      spyOn(user, 'reload').and.callThrough();
      spyOn(auth, 'createUserWithEmailAndPassword').and.callThrough();
      spyOn(auth, 'signInWithEmailAndPassword').and.callThrough();
      spyOn(sfaService, 'onSignedIn').and.callThrough();
      service.emailSignIn('foo@bar.co', 'password').then((result: any) => presult = result);
      tick();
      expect(service.emailHasPasswordProvider).toHaveBeenCalledWith('foo@bar.co');
      expect(user.updateProfile).not.toHaveBeenCalled();
      expect(user.sendEmailVerification).not.toHaveBeenCalled();
      expect(user.reload).toHaveBeenCalledWith();
      expect(auth.createUserWithEmailAndPassword).not.toHaveBeenCalledWith('foo@bar.co', 'password');
      expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith('foo@bar.co', 'password');
      expect(sfaService.onSignedIn).toHaveBeenCalledWith({user: presult, providerId: 'password'});
      expect(presult).toBe(user);
    }));

  })

});
