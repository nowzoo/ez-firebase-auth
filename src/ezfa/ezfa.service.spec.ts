import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import 'rxjs/add/operator/take';
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { EzfaOptions } from './ezfa-options.class';
import { EzfaProviderLabels } from './ezfa-provider-labels.class';
import { EzfaOauthMethod } from './ezfa-oauth-method.enum';
import { EzfaSignedInEvent } from './ezfa-signed-in-event.class';
import { EzfaSignedOutEvent } from './ezfa-signed-out-event.class';
import { EzfaEmailChangedEvent } from './ezfa-email-changed-event.class';
import { EzfaProviderLinkedEvent } from './ezfa-provider-linked-event.class';
import { EzfaProviderUnlinkedEvent } from './ezfa-provider-unlinked-event.class';

import { MOCK_USER, MOCK_USER_CRED} from './test';

import { EzfaService } from './ezfa.service';
describe('EzfaService', () => {
  let router;
  let options;
  let afAuth;
  beforeEach(() => {
    router = {navigate: () => Promise.resolve(true)};
    options = new EzfaOptions();
    options.rootSlug = 'auth';
    options.applicationLabel = 'Test App';
    afAuth = {auth: {setPersistence: () => Promise.resolve()}, authState: {foo: 8}};
    TestBed.configureTestingModule({
      providers: [
        EzfaService,
        {provide: AngularFireAuth, useValue: afAuth},
        {provide: EzfaOptions, useValue: options},
        {provide: Router, useValue: router}
      ]
    });
    router = TestBed.get(Router);
    options = TestBed.get(EzfaOptions);
    afAuth = TestBed.get(AngularFireAuth);
  });

  it('should be created', () => {
    const service: EzfaService = TestBed.get(EzfaService);
    expect(service).toBeTruthy();
  });

  describe('constructor setting oauthMethod', () => {
    describe('when set to popup', () => {
      beforeEach(() => {
        const changed = Object.assign(options, {oauthMethod: EzfaOauthMethod.popup});
        TestBed.overrideProvider(EzfaOptions, {useValue: changed});
      });
      it('should set the ouath method to popup if that is passed', () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.oauthMethod).toBe(EzfaOauthMethod.popup);
      });
    });
    describe('when not set', () => {
      beforeEach(() => {
        const changed = Object.assign(options, {oauthMethod: EzfaOauthMethod.popup});
        delete changed.oauthMethod;
        TestBed.overrideProvider(EzfaOptions, {useValue: changed});
      });
      it('should set the ouath method to redirect if missing', () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.oauthMethod).toBe(EzfaOauthMethod.redirect);
      });
    });
    describe('when set to redirect', () => {
      beforeEach(() => {
        const changed = Object.assign(options, {oauthMethod: EzfaOauthMethod.redirect});
        TestBed.overrideProvider(EzfaOptions, {useValue: changed});
      });
      it('should set the ouath method to redirect if missing', () => {
        const service: EzfaService = TestBed.get(EzfaService);
        expect(service.oauthMethod).toBe(EzfaOauthMethod.redirect);
      });
    });
  });
  describe('getters', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    it('should return the auth from from AngularFireAuth', () => {
      expect(service.auth).toBe(afAuth.auth);
    });
    it('should return the authState from AngularFireAuth', () => {
      expect(service.authState).toBe(afAuth.authState);
    });
    it('should return the applicationLabel from the options', () => {
      expect(service.applicationLabel).toBe(options.applicationLabel);
    });
    it('should return the rootSlug from the options', () => {
      expect(service.rootSlug).toBe(options.rootSlug);
    });
    describe('get providerIds', () => {
      it('should return whatever was passed in options.providerIds', () => {
        options.providerIds = [];
        expect(service.providerIds).toEqual([]);
        options.providerIds = ['twitter.com'];
        expect(service.providerIds).toEqual(['twitter.com']);
      });
      it('should limit whatever was passed in options.providerIds to the enabled providers', () => {
        options.providerIds = ['twitter.com', 'phone'];
        expect(service.providerIds).toEqual(['twitter.com']);
      });
    });
    describe('get requireDisplayName()', () => {
      it ('should return true if missing in options',   () => {
        delete options.requireDisplayName;
        expect(service.requireDisplayName).toBe(true);
      });
      it ('should return true if true in options',   () => {
        options.requireDisplayName = true;
        expect(service.requireDisplayName).toBe(true);
      });
      it ('should return false if false in options',   () => {
        options.requireDisplayName = false;
        expect(service.requireDisplayName).toBe(false);
      });
    });

    describe('get requireTos()', () => {
      it ('should return true if missing in options',   () => {
        delete options.requireTos;
        expect(service.requireTos).toBe(true);
      });
      it ('should return true if true in options',   () => {
        options.requireTos = true;
        expect(service.requireTos).toBe(true);
      });
      it ('should return false if false in options',   () => {
        options.requireTos = false;
        expect(service.requireTos).toBe(false);
      });
    });

    describe('get sendEmailVerificationLink()', () => {
      it ('should return true if missing in options',   () => {
        delete options.sendEmailVerificationLink;
        expect(service.sendEmailVerificationLink).toBe(true);
      });
      it ('should return true if true in options',   () => {
        options.sendEmailVerificationLink = true;
        expect(service.sendEmailVerificationLink).toBe(true);
      });
      it ('should return false if false in options',   () => {
        options.sendEmailVerificationLink = false;
        expect(service.sendEmailVerificationLink).toBe(false);
      });
    });
  });

  describe('set oauthMethod', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    it('should set the method', () => {
      expect(service.oauthMethod).toBe(EzfaOauthMethod.redirect);
      service.oauthMethod = EzfaOauthMethod.popup;
      expect(service.oauthMethod).toBe(EzfaOauthMethod.popup);

    });
  });

  describe('localPersistenceEnabled', () => {
    let service: EzfaService;
    describe('init when it has been disabled', () => {
      beforeEach(() => {
        spyOn(localStorage, 'getItem').and.callFake(() =>  'yes');
        service = TestBed.get(EzfaService);
      });
      it('should init the subject with false', fakeAsync(() => {
        let enabled;
        service.localPersistenceEnabled.take(1).subscribe(val => enabled = val);
        expect(enabled).toBe(false);
      }));
    });
    describe('init when it has not been disabled', () => {
      beforeEach(() => {
        spyOn(localStorage, 'getItem').and.callFake(() => undefined);
        service = TestBed.get(EzfaService);
      });
      it('should init the subject with false', fakeAsync(() => {
        let enabled;
        service.localPersistenceEnabled.take(1).subscribe(val => enabled = val);
        expect(enabled).toBe(true);
      }));
    });
    describe('setPersistenceLocal', () => {
      let enabled;
      beforeEach(() => {
        enabled = undefined;
        spyOn(localStorage, 'setItem').and.callFake(() => {} );
        spyOn(localStorage, 'removeItem').and.callFake(() => {} );
        service = TestBed.get(EzfaService);
        spyOn(service.auth, 'setPersistence').and.callThrough();

      });
      it('should make the right calls with false', fakeAsync(() => {
        service.setPersistenceLocal(false);
        expect(service.auth.setPersistence).toHaveBeenCalledWith(firebase.auth.Auth.Persistence.SESSION);
        tick();
        expect(localStorage.setItem).toHaveBeenCalledWith(EzfaService.STORAGE_KEY_PERSISTENCE, 'yes');
        service.localPersistenceEnabled.take(1).subscribe(val => enabled = val);
        expect(enabled).toBe(false);
      }));
      it('should make the right calls with true', fakeAsync(() => {
        service.setPersistenceLocal(true);
        expect(service.auth.setPersistence).toHaveBeenCalledWith(firebase.auth.Auth.Persistence.LOCAL);
        tick();
        expect(localStorage.removeItem).toHaveBeenCalledWith(EzfaService.STORAGE_KEY_PERSISTENCE);
        service.localPersistenceEnabled.take(1).subscribe(val => enabled = val);
        expect(enabled).toBe(true);
      }));
    });
  });


  describe('getProviderById()', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    EzfaService.ENABLED_PROVIDERS.forEach((id) => {
      it ('should return a default value for ' + id, fakeAsync(() => {
        let provider: any;
        options.providerIds = [id];
        service.getProviderById(id).then((result: any) => provider = result);
        tick();
        expect(provider.providerId).toBe(id);
      }));
    });
    it('should reject if passed a provider not configured in the options', fakeAsync(() => {
      let code: string|null = null;
      options.providerIds = ['password'];
      service.getProviderById('facebook.com').catch((err: any) => code = err.code);
      tick();
      expect(code).toBe('ezfa/provider-not-configured');
    }));
    it('should resolve with custom provider if one has been passed in providers', fakeAsync(() => {
      let provider;
      options.providerIds = ['twitter.com'];
      options.providers = [{providerId: 'twitter.com', custom: true}];
      service.getProviderById('twitter.com').then((result: any) => provider = result);
      tick();
      expect(provider.custom).toBe(true);
    }));

  });

  describe('routerLink()', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    it ('should return an array of string with the rootSlug as the first one', () => {
      const link = service.routerLink('foo');
      expect(link).toEqual(['/auth', 'foo']);
    });
    it ('should return an array of string if the first param is undefined', () => {
      const link = service.routerLink();
      expect(link).toEqual(['/auth']);
    });
    it ('should return an array of string if the first param is null', () => {
      const link = service.routerLink(null);
      expect(link).toEqual(['/auth']);
    });
    it ('should return an array of string if the first param is ""', () => {
      const link = service.routerLink('');
      expect(link).toEqual(['/auth']);
    });
  });

  describe('navigate()', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    beforeEach(() => {
      spyOn(service, 'routerLink').and.callThrough();
      spyOn(router, 'navigate').and.callThrough();
    });
    it ('should call routerLink with the first param', () => {
      const link = service.navigate('foo');
      expect(service.routerLink).toHaveBeenCalledWith('foo');
    });
    it ('should call router.navigate', () => {
      const link = service.navigate('foo');
      expect(router.navigate).toHaveBeenCalledWith(['/auth', 'foo'], undefined);
    });
  });

  describe('signedInEvents and onSignedIn', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    it ('should return an observable', () => {
      const anEvent = new EzfaSignedInEvent(MOCK_USER, 'password');
      let result;
      service.signedInEvents.take(1).subscribe(e => result = e);
      service.onSignedIn(anEvent);
      expect(result).toBe(anEvent);
    });
    it ('should allow cancelling the redirect', () => {
      const anEvent = new EzfaSignedInEvent(MOCK_USER, 'password');
      expect(anEvent.redirectCancelled).toBe(false);
      let result;
      service.signedInEvents.take(1).subscribe(e => {
        result = e;
        result.redirectCancelled = true;
      });
      service.onSignedIn(anEvent);
      expect(result).toBe(anEvent);
      expect(anEvent.redirectCancelled).toBe(true);
    });
  });

  describe('signedOutEvents and onSignedOut', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    it ('should return an observable', () => {
      const anEvent = new EzfaSignedOutEvent();
      let result;
      service.signedOutEvents.take(1).subscribe(e => result = e);
      service.onSignedOut(anEvent);
      expect(result).toBe(anEvent);
    });
    it ('should allow cancelling the redirect', () => {
      const anEvent = new EzfaSignedOutEvent();
      expect(anEvent.redirectCancelled).toBe(false);
      let result;
      service.signedOutEvents.take(1).subscribe(e => {
        result = e;
        result.redirectCancelled = true;
      });
      service.onSignedOut(anEvent);
      expect(result).toBe(anEvent);
      expect(anEvent.redirectCancelled).toBe(true);
    });
  });

  describe('emailChangedEvents and onEmailChanged', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    it ('should return an observable', () => {
      const anEvent = new EzfaEmailChangedEvent(MOCK_USER, 'a@b.co', 'b@c.co');
      let result;
      service.emailChangedEvents.take(1).subscribe(e => result = e);
      service.onEmailChanged(anEvent);
      expect(result).toBe(anEvent);
    });

  });

  describe('providerLinkedEvents and onProviderLinked', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    it ('should return an observable', () => {
      const anEvent = new EzfaProviderLinkedEvent(MOCK_USER, 'twitter.com', MOCK_USER_CRED);
      let result;
      service.providerLinkedEvents.take(1).subscribe(e => result = e);
      service.onProviderLinked(anEvent);
      expect(result).toBe(anEvent);
    });

  });

  describe('providerUnlinkedEvents and onProviderUnlinked', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    it ('should return an observable', () => {
      const anEvent = new EzfaProviderUnlinkedEvent(MOCK_USER, 'twitter.com');
      let result;
      service.providerUnlinkedEvents.take(1).subscribe(e => result = e);
      service.onProviderUnlinked(anEvent);
      expect(result).toBe(anEvent);
    });
  });

  describe('routeChanges and onRouteChange', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    it ('should return an observable', () => {
      let result;
      service.routeChanges.take(1).subscribe(e => result = e);
      service.onRouteChange('foo');
      expect(result).toBe('foo');
    });

  });

  describe('savedPopupPromise', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    it('should work with null', () => {
      service.savedPopupPromise = null;
      expect(service.savedPopupPromise).toBe(null);
    });
    it('should work with a promise', () => {
      const p = new Promise<firebase.auth.UserCredential>((resolve) => {});
      service.savedPopupPromise = p;
      expect(service.savedPopupPromise).toBe(p);
    });
  });

  describe('get providerLabels', () => {
    let defs;
    let service: EzfaService;
    beforeEach(() => {
      defs = new EzfaProviderLabels();
      service = TestBed.get(EzfaService);
    });
    it ('should return defaults if labels is not defined', () => {
      delete options.providerLabels;
      expect(service.providerLabels).toEqual(jasmine.objectContaining(defs));
    });
    it ('should be correct if labels is partially defined', () => {
      options.providerLabels = {'twitter.com': 'foobar'};
      expect(service.providerLabels['twitter.com']).toEqual('foobar');
      expect(service.providerLabels['facebook.com']).toEqual('Facebook');
    });
  });

  describe('set requireDisplayName', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    it('should set the value', () => {
      expect(service.requireDisplayName).toBe(true);
      service.requireDisplayName = false;
      expect(service.requireDisplayName).toBe(false);
    });
  });

  describe('set requireTos', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    it('should set the value', () => {
      expect(service.requireTos).toBe(true);
      service.requireTos = false;
      expect(service.requireTos).toBe(false);
    });
  });

  describe('set providerIds', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    it('should set the value', () => {
      expect(service.providerIds).toEqual([]);
      service.providerIds = ['twitter.com'];
      expect(service.providerIds).toEqual(['twitter.com']);
    });
  });

  describe('set sendEmailVerificationLink', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    it('should set the value', () => {
      expect(service.sendEmailVerificationLink).toEqual(true);
      service.sendEmailVerificationLink = false;
      expect(service.sendEmailVerificationLink).toEqual(false);
    });
  });

  describe('get  oauthProviderIds', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    it('should get the value', () => {
      expect(service.oauthProviderIds).toEqual([]);
      service.providerIds = ['twitter.com'];
      expect(service.oauthProviderIds).toEqual(['twitter.com']);
    });
  });

  describe('get  passwordProviderEnabled', () => {
    let service: EzfaService;
    beforeEach(() => {
      service = TestBed.get(EzfaService);
    });
    it('should get the value', () => {
      expect(service.passwordProviderEnabled).toEqual(false);
      service.providerIds = ['twitter.com', 'password'];
      expect(service.passwordProviderEnabled).toEqual(true);
    });
  });

});
