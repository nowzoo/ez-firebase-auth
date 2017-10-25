import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { Router, NavigationExtras } from '@angular/router';
import { EzfaService } from './ezfa.service';
import 'rxjs/add/operator/take';
import {
  EzfaOptions, OAuthMethod,
  EzfaProviderLabels, LOCAL_PERSISTENCE_DISABLED_STORAGE_KEY,
  IAuthUserEvent,
  IAuthEmailChangedEvent
} from './ezfa';
import {AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';

const options = new EzfaOptions();

describe('EzfaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EzfaService,
        {provide: EzfaOptions, useValue: options},
        {provide: AngularFireAuth, useValue: {}},
        {provide: Router, useValue: {}}
      ]
    });
  });

  it('should be created', () => {
    const service: EzfaService = TestBed.get(EzfaService);
    expect(service).toBeTruthy();
  });

  describe('get auth()', () => {
    const auth = {foo: 8};
    beforeEach(() => {
      TestBed.overrideProvider(AngularFireAuth, { useValue: {auth: auth}});
    })
    it ('should return the auth',  () => {
      const service: EzfaService = TestBed.get(EzfaService);
      expect(service.auth).toBe(auth);
    })
  })

  describe('get authState()', () => {
    const authState = {foo: 8};
    beforeEach(() => {
      TestBed.overrideProvider(AngularFireAuth, { useValue: {authState: authState}});
    })
    it ('should return the authState',  () => {
      const service: EzfaService = TestBed.get(EzfaService);
      expect(service.authState).toBe(authState);
    })
  })

  describe('get applicationLabel()', () => {
    const opt = {applicationLabel: 'foo'};
    beforeEach(() => {
      TestBed.overrideProvider(EzfaOptions, { useValue: opt});
    })
    it ('should return the value',   () => {
      const service: EzfaService = TestBed.get(EzfaService);
      expect(service.applicationLabel).toBe('foo');
    })
  })

  describe('get rootSlug()', () => {
    const opt = {rootSlug: 'foo'};
    beforeEach(() => {
      TestBed.overrideProvider(EzfaOptions, { useValue: opt});
    })
    it ('should return the value',   () => {
      const service: EzfaService = TestBed.get(EzfaService);
      expect(service.rootSlug).toBe('foo');
    })
  })

  describe('get configuredProviderIds()', () => {
    const opt = {configuredProviderIds: ['password']};
    beforeEach(() => {
      TestBed.overrideProvider(EzfaOptions, { useValue: opt});
    })
    it ('should return the value', () => {
      const service: EzfaService = TestBed.get(EzfaService);
      expect(service.configuredProviderIds).toEqual(['password']);
    })
  })
  describe('get oAuthProviderIds()', () => {
    const opt = {configuredProviderIds: ['password', 'twitter.com']};
    beforeEach(() => {
      TestBed.overrideProvider(EzfaOptions, { useValue: opt});
    })
    it ('should return the value',   () => {
      const service: EzfaService = TestBed.get(EzfaService);
      expect(service.oAuthProviderIds).toEqual(['twitter.com']);
    })
  })
  describe('get providerById()', () => {
    const allIds =  ['password', 'twitter.com', 'facebook.com', 'github.com', 'google.com'];
    let opt: any = {
      configuredProviderIds: allIds,
    };
    beforeEach( () => {
      TestBed.overrideProvider(EzfaOptions, { useValue: opt});
    });

    it ('should return a default value for each provider', fakeAsync(() => {
      const service: EzfaService = TestBed.get(EzfaService);
      let provider: any;
      service.getProviderById('password').then((result: any) => provider = result);
      tick();
      expect(provider.providerId).toBe('password')

      service.getProviderById('twitter.com').then((result: any) => provider = result);
      tick();
      expect(provider.providerId).toBe('twitter.com');

      service.getProviderById('github.com').then((result: any) => provider = result);
      tick();
      expect(provider.providerId).toBe('github.com')

      service.getProviderById('google.com').then((result: any) => provider = result);
      tick();
      expect(provider.providerId).toBe('google.com');

      service.getProviderById('facebook.com').then((result: any) => provider = result);
      tick();
      expect(provider.providerId).toBe('facebook.com')
    }))
    describe('unconfigured provider', () => {
      beforeEach( () => {
        opt.configuredProviderIds = ['password'];
        TestBed.overrideProvider(EzfaOptions, { useValue: opt});
      });
      it('should reject if passed a provider not configured in the options', fakeAsync(() => {
        let code: string|null = null;
        const service: EzfaService = TestBed.get(EzfaService);
        service.getProviderById('facebook.com').catch((err: firebase.FirebaseError) => code = err.code);
        tick();
        expect(code).toBe('ezfa/provider-not-configured')
      }))
    })
    describe('custom provider', () => {
      beforeEach( () => {
        opt = {
          configuredProviderIds: allIds,
          customizedProviders: [{providerId: 'facebook.com', foo: 67}]
        }
        TestBed.overrideProvider(EzfaOptions, { useValue: opt});
      });
      it('should resolve with custom provider', fakeAsync(() => {
        let provider: any;
        const service: EzfaService = TestBed.get(EzfaService);
        service.getProviderById('facebook.com').then((result: any) => provider = result);
        tick();
        expect(provider.foo).toBe(67)
      }))
    })
  })

  describe('get requireDisplayName()', () => {
    describe('when missing in options', () => {
      const opt = {};
      beforeEach(() => {
        TestBed.overrideProvider(EzfaOptions, { useValue: opt});
      })
      it ('should return true',   () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.requireDisplayName).toBe(true);
      })
    })
    describe('when true in options', () => {
      const opt = {requireDisplayName: true};
      beforeEach(() => {
        TestBed.overrideProvider(EzfaOptions, { useValue: opt});
      })
      it ('should return true',   () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.requireDisplayName).toBe(true);
      })
    })
    describe('when false in options', () => {
      const opt = {requireDisplayName: false};
      beforeEach(() => {
        TestBed.overrideProvider(EzfaOptions, { useValue: opt});
      })
      it ('should return true',   () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.requireDisplayName).toBe(false);
      })
    })
  })

  describe('get requireTos()', () => {
    describe('when missing in options', () => {
      const opt = {};
      beforeEach(() => {
        TestBed.overrideProvider(EzfaOptions, { useValue: opt});
      })
      it ('should return true',   () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.requireTos).toBe(true);
      })
    })
    describe('when true in options', () => {
      const opt = {requireTos: true};
      beforeEach(() => {
        TestBed.overrideProvider(EzfaOptions, { useValue: opt});
      })
      it ('should return true',   () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.requireTos).toBe(true);
      })
    })
    describe('when false in options', () => {
      const opt = {requireTos: false};
      beforeEach(() => {
        TestBed.overrideProvider(EzfaOptions, { useValue: opt});
      })
      it ('should return true',   () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.requireTos).toBe(false);
      })
    })
  })
  describe('get sendEmailVerificationLink()', () => {
    describe('when missing in options', () => {
      const opt = {};
      beforeEach(() => {
        TestBed.overrideProvider(EzfaOptions, { useValue: opt});
      })
      it ('should return true',   () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.sendEmailVerificationLink).toBe(true);
      })
    })
    describe('when true in options', () => {
      const opt = {sendEmailVerificationLink: true};
      beforeEach(() => {
        TestBed.overrideProvider(EzfaOptions, { useValue: opt});
      })
      it ('should return true',   () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.sendEmailVerificationLink).toBe(true);
      })
    })
    describe('when false in options', () => {
      const opt = {sendEmailVerificationLink: false};
      beforeEach(() => {
        TestBed.overrideProvider(EzfaOptions, { useValue: opt});
      })
      it ('should return false',   () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.sendEmailVerificationLink).toBe(false);
      })
    })
  })


  describe('set oAuthMethod()', () => {
    const opt = {oAuthMethod: OAuthMethod.popup};
    beforeEach(() => {
      TestBed.overrideProvider(EzfaOptions, { useValue: opt});
    });
    it ('should set the value',   () => {
      const service: EzfaService = TestBed.get(EzfaService);
      expect(service.oAuthMethod).toBe(OAuthMethod.popup);
      service.oAuthMethod = OAuthMethod.redirect;
      expect(service.oAuthMethod).toBe(OAuthMethod.redirect);
    })
  })

  describe('get oAuthMethod()', () => {
    describe ('when no option is set', () => {
      const opt = {};
      beforeEach(() => {
        TestBed.overrideProvider(EzfaOptions, { useValue: opt});
      });
      it ('should be redirect',   () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.oAuthMethod).toBe(OAuthMethod.redirect);
      })
    })
    describe ('when an option is set in options', () => {
      const opt = {oAuthMethod: OAuthMethod.popup};
      beforeEach(() => {
        TestBed.overrideProvider(EzfaOptions, { useValue: opt});
      });
      it ('should be popup',   () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.oAuthMethod).toBe(OAuthMethod.popup);
      })
    })
    describe ('when an option subsequently set', () => {
      const opt = {};
      beforeEach(() => {
        TestBed.overrideProvider(EzfaOptions, { useValue: opt});
      });
      it ('should be popup',   () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.oAuthMethod).toBe(OAuthMethod.redirect);
        service.oAuthMethod = OAuthMethod.popup;
        expect(service.oAuthMethod).toBe(OAuthMethod.popup);
      })
    })
  })
  describe('get providerLabels()', () => {
    const defaultLabels = new EzfaProviderLabels();
    describe('when no option is set', () => {
      const opt = {};
      beforeEach(() => {
        TestBed.overrideProvider(EzfaOptions, { useValue: opt});
      })
      it ('should return the defaults',   () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.providerLabels['twitter.com']).toBe(defaultLabels['twitter.com']);
      })
    })
    describe('when an incomplete option is set', () => {
      const opt = {providerLabels: {'twitter.com': 'Tweeter'}};
      beforeEach(() => {
        TestBed.overrideProvider(EzfaOptions, { useValue: opt});
      })
      it ('should return the value',   () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.providerLabels['twitter.com']).toBe('Tweeter');
      })
    })
  })

  describe('get persistenceLocal()', () => {
    describe('when it has been disabled', () => {
      beforeEach(() => {
        spyOn(localStorage, 'getItem').and.returnValue('yes');
      });
      it('should return an observable with a value of false', fakeAsync(() => {
        const service: EzfaService = TestBed.get(EzfaService);
        let value;
        service.persistenceLocal.take(1).subscribe((val: boolean) => value = val);
        tick();
        expect(value).toBe(false);
      }));
    })
    describe('when it has not been disabled', () => {
      beforeEach(() => {
        spyOn(localStorage, 'getItem').and.returnValue(undefined);
      });
      it('should return an observable with a value of true', fakeAsync(() => {
        const service: EzfaService = TestBed.get(EzfaService);
        let value;
        service.persistenceLocal.take(1).subscribe((val: boolean) => value = val);
        tick();
        expect(value).toBe(true);
      }));
    })
  })
  describe('setPersistenceLocal()', () => {
    const auth = {foo: 8, setPersistence: (val: any): Promise<void> => {
      return new Promise<void>((resolve) => resolve());
    }}
    const fbAuth = {auth: auth};
    beforeEach(() => {
      TestBed.overrideProvider(AngularFireAuth, {useValue: fbAuth});
      spyOn(auth, 'setPersistence').and.callThrough();
      spyOn(localStorage, 'removeItem').and.callFake(() => {});
      spyOn(localStorage, 'setItem').and.callFake(() => {});
    });
    describe('setting false', () => {
      it(`should return a promise that resolves after setting the
        persistence with firebase and storing "yes" in local storage`, fakeAsync(() => {
        const service: EzfaService = TestBed.get(EzfaService);
        let value;
        let resolved = false
        service.setPersistenceLocal(false).then(() => resolved = true);
        tick();
        expect(resolved).toBe(true);
        expect (auth.setPersistence).toHaveBeenCalledWith(firebase.auth.Auth.Persistence.SESSION);
        expect(localStorage.setItem).toHaveBeenCalledWith(LOCAL_PERSISTENCE_DISABLED_STORAGE_KEY, 'yes')
        service.persistenceLocal.take(1).subscribe((val: boolean) => value = val);
        tick();
        expect(value).toBe(false);
      }));
    })
    describe('setting true', () => {
      it(`should return a promise that resolves after setting the
        persistence with firebase and clearing local storage`, fakeAsync(() => {
        const service: EzfaService = TestBed.get(EzfaService);
        let value;
        let resolved = false
        service.setPersistenceLocal(true).then(() => resolved = true);
        tick();
        expect(resolved).toBe(true);
        expect (auth.setPersistence).toHaveBeenCalledWith(firebase.auth.Auth.Persistence.LOCAL);
        expect(localStorage.removeItem).toHaveBeenCalledWith(LOCAL_PERSISTENCE_DISABLED_STORAGE_KEY)
        service.persistenceLocal.take(1).subscribe((val: boolean) => value = val);
        tick();
        expect(value).toBe(true);
      }));
    })

  })
  describe('get/set authRedirectCancelled()', () => {
    it('should be false to start with', () => {
      const service: EzfaService = TestBed.get(EzfaService);
      expect(service.authRedirectCancelled).toBe(false);
    })
    it('should be the value set', () => {
      const service: EzfaService = TestBed.get(EzfaService);
      expect(service.authRedirectCancelled).toBe(false);
      service.authRedirectCancelled = true;
      expect(service.authRedirectCancelled).toBe(true);
      service.authRedirectCancelled = false;
      expect(service.authRedirectCancelled).toBe(false);

    })
  });

  describe('get signedIn()', () => {
    it('should be an observable', () => {
      const service: EzfaService = TestBed.get(EzfaService);
      expect(service.signedIn.subscribe).toBeTruthy();
    })
  })
  describe('onSignedIn()', () => {
    it('should push a new event to the observable', fakeAsync(() => {
      const service: EzfaService = TestBed.get(EzfaService);
      let e: any;
      spyOn(service, 'navigate').and.returnValue(Promise.resolve(true));
      service.signedIn.subscribe((result:  IAuthUserEvent) => e = result);
      service.onSignedIn({user: {} as firebase.User, providerId: 'bar'});
      tick();
      expect(e.providerId).toBe('bar');
    }));
    it('should redirect to account if the redirect is not cancelled', fakeAsync(() => {
      const service: EzfaService = TestBed.get(EzfaService);
      spyOn(service, 'navigate').and.returnValue(Promise.resolve(true));
      service.onSignedIn({user: {} as firebase.User, providerId: 'bar'});
      tick();
      expect(service.navigate).toHaveBeenCalledWith('account');
    }));
    it('should not redirect to account if the redirect is cancelled', fakeAsync(() => {
      const service: EzfaService = TestBed.get(EzfaService);
      spyOn(service, 'navigate').and.returnValue(Promise.resolve(true));
      service.signedIn.subscribe((result:  IAuthUserEvent) => service.authRedirectCancelled = true);
      service.onSignedIn({user: {} as firebase.User, providerId: 'bar'});
      tick();
      expect(service.navigate).not.toHaveBeenCalledWith('account');
    }));
  })

  describe('get signedOut()', () => {
    it('should be an observable', () => {
      const service: EzfaService = TestBed.get(EzfaService);
      expect(service.signedOut.subscribe).toBeTruthy();
    })
  })

  describe('onSignedOut()', () => {
    it('should push a new event to the observable', fakeAsync(() => {
      const service: EzfaService = TestBed.get(EzfaService);
      let pushed = false;
      spyOn(service, 'navigate').and.returnValue(Promise.resolve(true));
      service.signedOut.subscribe(() => pushed = true);
      service.onSignedOut();
      tick();
      expect(pushed).toBe(true);
    }));
    it('should redirect to sign in if the redirect is not cancelled', fakeAsync(() => {
      const service: EzfaService = TestBed.get(EzfaService);
      spyOn(service, 'navigate').and.returnValue(Promise.resolve(true));
      service.onSignedOut();
      tick();
      expect(service.navigate).toHaveBeenCalledWith('sign-in');
    }));
    it('should not redirect to sign in if the redirect is cancelled', fakeAsync(() => {
      const service: EzfaService = TestBed.get(EzfaService);
      spyOn(service, 'navigate').and.returnValue(Promise.resolve(true));
      service.signedOut.subscribe(() => service.authRedirectCancelled = true);
      service.onSignedOut();
      tick();
      expect(service.navigate).not.toHaveBeenCalledWith('sign-in');
    }));
  })

  describe('get providerLinked()', () => {
    it('should be an observable', () => {
      const service: EzfaService = TestBed.get(EzfaService);
      expect(service.providerLinked.subscribe).toBeTruthy();
    })
  })

  describe('onProviderLinked()', () => {
    it('should push a new event to the observable', fakeAsync(() => {
      const service: EzfaService = TestBed.get(EzfaService);
      let e: any;
      service.providerLinked.subscribe((result: IAuthUserEvent) => e = result);
      service.onProviderLinked({user: {} as firebase.User, providerId: 'bar'});
      tick();
      expect(e.providerId).toBe('bar');
    }));
  })
  describe('get providerUnlinked()', () => {
    it('should be an observable', () => {
      const service: EzfaService = TestBed.get(EzfaService);
      expect(service.providerLinked.subscribe).toBeTruthy();
    })
  })
  describe('onProviderUnlinked()', () => {
    it('should push a new event to the observable', fakeAsync(() => {
      const service: EzfaService = TestBed.get(EzfaService);
      let e: any;
      service.providerUnlinked.subscribe((result: IAuthUserEvent) => e = result);
      service.onProviderUnlinked({user: {} as firebase.User, providerId: 'bar'});
      tick();
      expect(e.providerId).toBe('bar');
    }));
  })

  describe('get emailChanged()', () => {
    it('should be an observable', () => {
      const service: EzfaService = TestBed.get(EzfaService);
      expect(service.emailChanged.subscribe).toBeTruthy();
    })
  })

  describe('onEmailChanged()', () => {
    it('should push a new event to the observable', fakeAsync(() => {
      const service: EzfaService = TestBed.get(EzfaService);
      let e: any;
      service.emailChanged.subscribe((result: IAuthEmailChangedEvent) => e = result);
      service.onEmailChanged({user: {} as firebase.User, oldEmail: 'bar', newEmail: 'foo'});
      tick();
      expect(e.oldEmail).toBe('bar');
    }));
  })

  describe('get route()', () => {
    it('should be an observable', () => {
      const service: EzfaService = TestBed.get(EzfaService);
      expect(service.route.subscribe).toBeTruthy();
    })
  })

  describe('onRoute()', () => {
    it('should push a new slug to the observable', fakeAsync(() => {
      const service: EzfaService = TestBed.get(EzfaService);
      let slug: string | null = null;
      service.route.subscribe((result: string) => slug = result);
      service.onRoute('account');
      tick();
      expect(slug).toBe('account');
    }));
  })

  describe('routerLink()', () => {
    beforeEach(() => {
      TestBed.overrideProvider(EzfaOptions, {useValue: {rootSlug: 'auth'}});
    });

    it ('should return an array of string with the rootSlug as the first one', () => {
      const service: EzfaService = TestBed.get(EzfaService);
      const link = service.routerLink('foo');
      expect(link).toEqual(['/auth', 'foo']);
    })
    it ('should return an array of string if the first param is undefined', () => {
      const service: EzfaService = TestBed.get(EzfaService);
      const link = service.routerLink();
      expect(link).toEqual(['/auth']);
    })
  });

  describe('routerLink()', () => {
    const router = {
      navigate: (commands: string[], extras: NavigationExtras) => {
        return Promise.resolve(true);
      }
    }
    beforeEach(() => {
      spyOn(router, 'navigate').and.callThrough();
      TestBed.overrideProvider(EzfaOptions, {useValue: {rootSlug: 'auth'}});
      TestBed.overrideProvider(Router, {useValue: router});
    });

    it ('should call router.navigate correctly if both params are present', () => {
      const service: EzfaService = TestBed.get(EzfaService);
      service.navigate('account', {queryParams: {foo: 'bar'}});
      expect(router.navigate).toHaveBeenCalledWith(['/auth', 'account'], {queryParams: {foo: 'bar'}})
    })
    it ('should call router.navigate correctly if the first param is missing', () => {
      const service: EzfaService = TestBed.get(EzfaService);
      service.navigate(null, {queryParams: {foo: 'bar'}});
      expect(router.navigate).toHaveBeenCalledWith(['/auth'], {queryParams: {foo: 'bar'}})
    })
    it ('should call router.navigate correctly if the second param is missing', () => {
      const service: EzfaService = TestBed.get(EzfaService);
      service.navigate('account');
      expect(router.navigate).toHaveBeenCalledWith(['/auth', 'account'], undefined)
    })
  })


});
