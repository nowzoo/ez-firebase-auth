import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import * as firebase from 'firebase';

import { OauthService } from './oauth.service';
import { SfaService } from '../sfa/sfa.service';
import { StoredOauthData } from './stored-oauth-data.class';



describe('OauthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OauthService,
        {provide: SfaService, useValue: {}}
      ]
    });

  });

  it('should be created', () => {
    const service: OauthService = TestBed.get(OauthService);
    expect(service).toBeTruthy();
  });

  describe('setStoredOAuthData()', () => {
    beforeEach(() => {
      spyOn(sessionStorage, 'setItem').and.callFake(() => {});
    })
    it('should store under the right key', () => {
      const service: OauthService = TestBed.get(OauthService);
      const data: StoredOauthData = {providerId: 'twitter.com', operationType: 'signIn'};
      service.setStoredOAuthData(data);
      expect(sessionStorage.setItem).toHaveBeenCalledWith(OauthService.REDIRECT_KEY, JSON.stringify(data))
    })
  })
  describe('getStoredOAuthData()', () => {
    const data: StoredOauthData = {providerId: 'twitter.com', operationType: 'signIn'};
    let spyGetItem;
    beforeEach(() => {
      spyGetItem = spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify(data));
      spyOn(sessionStorage, 'removeItem').and.callFake(() => {});
    })
    it('should return an object if the key is stored', () => {
      const service: OauthService = TestBed.get(OauthService);
      const returned = service.getStoredOAuthData();
      expect(sessionStorage.getItem).toHaveBeenCalledWith(OauthService.REDIRECT_KEY);
      expect(sessionStorage.removeItem).toHaveBeenCalledWith(OauthService.REDIRECT_KEY);
      expect(returned).toEqual(jasmine.objectContaining(data))
    })
    it('should return null if the key is not stored', () => {
      const service: OauthService = TestBed.get(OauthService);
      spyGetItem.and.returnValue(null);
      const returned = service.getStoredOAuthData();
      expect(sessionStorage.getItem).toHaveBeenCalledWith(OauthService.REDIRECT_KEY);
      expect(sessionStorage.removeItem).toHaveBeenCalledWith(OauthService.REDIRECT_KEY);
      expect(returned).toEqual(null)
    })
    it('should return null if the staored value is invalid json', () => {
      const service: OauthService = TestBed.get(OauthService);
      spyGetItem.and.returnValue('invalid json');
      const returned = service.getStoredOAuthData();
      expect(sessionStorage.getItem).toHaveBeenCalledWith(OauthService.REDIRECT_KEY);
      expect(sessionStorage.removeItem).toHaveBeenCalledWith(OauthService.REDIRECT_KEY);
      expect(returned).toEqual(null)
    })
  })

  describe('getOAuthExtendedError(error: any, providerId: string)', () => {
    const auth = {fetchProvidersForEmail: () =>  Promise.resolve(['twitter.com'])}
    const sfaService = {auth: auth};
    let fetchSpy;
    beforeEach(() => {
      fetchSpy = spyOn(auth, 'fetchProvidersForEmail').and.callThrough();
      TestBed.overrideProvider(SfaService, {useValue: sfaService});
    });
    it('should return an object with the passed providerId', fakeAsync(() => {
      const service: OauthService = TestBed.get(OauthService);
      let extended: any;
      service.getOAuthExtendedError({code: 'foo'}, 'twitter.com').then(result => extended = result);
      tick();
      expect(extended.providerId).toBe('twitter.com')
    }))
    it('should fetch providers for auth/account-exists-with-different-credential', fakeAsync(() => {
      const service: OauthService = TestBed.get(OauthService);
      let extended: any;
      service.getOAuthExtendedError(
        {code: 'auth/account-exists-with-different-credential', email: 'foo@b.co'}, 'password')
        .then(result => extended = result);
      tick();
      expect(extended.providerId).toBe('password');
      expect(fetchSpy).toHaveBeenCalledWith('foo@b.co');
      expect(extended.providerIdsForEmail).toEqual(['twitter.com']);
    }))
    it('should ignore fetchProvidersForEmail errors', fakeAsync(() => {
      const service: OauthService = TestBed.get(OauthService);
      let extended: any;
      fetchSpy.and.returnValue(Promise.reject({code: 'auth/unexpected'}))
      service.getOAuthExtendedError(
        {code: 'auth/account-exists-with-different-credential', email: 'foo@b.co'}, 'password')
        .then(result => extended = result);
      tick();
      expect(extended.providerId).toBe('password');
      expect(fetchSpy).toHaveBeenCalledWith('foo@b.co');
      expect(extended.providerIdsForEmail).toEqual([]);
    }))
  })



  describe('handleOAuthSuccess(cred, operationType)', () => {
    const cred = {
      user: {uid: 'foo'},
      credential: {providerId: 'twitter.com'}
    }
    const authService = {
      onSignedIn: () => {},
      onProviderLinked: () => {}
    }
    beforeEach(() => {
      spyOn(authService, 'onSignedIn').and.callThrough();
      spyOn(authService, 'onProviderLinked').and.callThrough();
      TestBed.overrideProvider(SfaService, {useValue: authService});
    })
    it('should resolve if passed a user credential and "signIn"', fakeAsync(() => {
      /* tslint:disable:member-access */
      const service: OauthService = TestBed.get(OauthService);
      let resolved: any;
      service.handleOAuthSuccess(cred, 'signIn').then(result => resolved = result);
      tick();
      expect(resolved.credential).toEqual(cred)
      expect(resolved.user).toEqual(cred.user)
      expect(resolved.providerId).toEqual(cred.credential.providerId)
      expect(authService.onSignedIn).toHaveBeenCalledWith(jasmine.objectContaining(resolved))
    }))
    it('should resolve if passed a user credential and "link"', fakeAsync(() => {
      /* tslint:disable:member-access */
      const service: OauthService = TestBed.get(OauthService);
      let resolved: any;
      service.handleOAuthSuccess(cred, 'link').then(result => resolved = result);
      tick();
      expect(resolved.credential).toEqual(cred)
      expect(resolved.user).toEqual(cred.user)
      expect(resolved.providerId).toEqual(cred.credential.providerId)
      expect(authService.onProviderLinked).toHaveBeenCalledWith(jasmine.objectContaining(resolved))
    }))
    it('should resolve if passed a user credential and "reathenticate"', fakeAsync(() => {
      /* tslint:disable:member-access */
      const service: OauthService = TestBed.get(OauthService);
      let resolved: any;
      service.handleOAuthSuccess(cred, 'reathenticate').then(result => resolved = result);
      tick();
      expect(resolved.credential).toEqual(cred)
      expect(resolved.user).toEqual(cred.user)
      expect(resolved.providerId).toEqual(cred.credential.providerId)
      expect(authService.onSignedIn).not.toHaveBeenCalledWith(jasmine.objectContaining(resolved))
      expect(authService.onProviderLinked).not.toHaveBeenCalledWith(jasmine.objectContaining(resolved))
    }))

    it('should resolve  with null if cred.user is null', fakeAsync(() => {
      /* tslint:disable:member-access */
      const service: OauthService = TestBed.get(OauthService);
      let resolved: any;
      service.handleOAuthSuccess({user: null}, 'signIn').then(result => resolved = result);
      tick();
      expect(resolved).toEqual(null)
      expect(authService.onSignedIn).not.toHaveBeenCalled()
    }))
  })

  describe('checkForRedirect(operationType)', () => {
    const cred = {
      user: {uid: 'foo'},
      credential: {providerId: 'twitter.com'}
    }
    const auth = {
      getRedirectResult: () => Promise.resolve()
    };
    const authService = {auth: auth, onSignedIn: () => {}, onProviderLinked: () => {}};
    let service: OauthService;
    let getRedirectResultSpy;
    let getStoredOAuthDataSpy;
    let resolved;
    let rejected;
    beforeEach(() => {
      getRedirectResultSpy = spyOn(auth, 'getRedirectResult').and.callThrough();
      TestBed.overrideProvider(SfaService, {useValue: authService});
      service = TestBed.get(OauthService);
      spyOn(service, 'getOAuthExtendedError').and.callFake((err) => Promise.resolve(err));
      getStoredOAuthDataSpy = spyOn(service, 'getStoredOAuthData').and.returnValue(null);
      resolved = undefined;
      rejected = undefined;
    });
    it('should resolve with null if there is no stored data', fakeAsync(() => {
      service.checkForRedirect('signIn').then(result => resolved = result);
      tick();
      expect(resolved).toBe(null);
      expect(getStoredOAuthDataSpy).toHaveBeenCalledWith();
    }));
    it('should resolve with null the stored data operation type does not match the param', fakeAsync(() => {
      getStoredOAuthDataSpy.and.returnValue({operationType: 'reauthenticate', providerId: 'twitter.com'})
      service.checkForRedirect('signIn').then(result => resolved = result);
      tick();
      expect(resolved).toBe(null);
      expect(getStoredOAuthDataSpy).toHaveBeenCalledWith();
    }))
    it('should resolve with null if the api getRedirectResult returns a cred with null user', fakeAsync(() => {
      getStoredOAuthDataSpy.and.returnValue({operationType: 'signIn', providerId: 'twitter.com'})
      getRedirectResultSpy.and.callFake(() => Promise.resolve({user: null}))
      service.checkForRedirect('signIn').then(result => resolved = result);
      tick();
      expect(resolved).toBe(null);
      expect(getStoredOAuthDataSpy).toHaveBeenCalledWith();
    }))
    it('should resolve with an event if the api getRedirectResult returns a cred with user and cred', fakeAsync(() => {
      getStoredOAuthDataSpy.and.returnValue({operationType: 'signIn', providerId: 'twitter.com'})
      getRedirectResultSpy.and.callFake(() => Promise.resolve({user: {uid: 'foo'}, credential: {providerId: 'twitter.com'}}))
      service.checkForRedirect('signIn').then(result => resolved = result);
      tick();
      expect(resolved).toBeTruthy();
      expect(getStoredOAuthDataSpy).toHaveBeenCalledWith();
    }))
    it('should reject if api getRedirectResult rejects', fakeAsync(() => {
      getStoredOAuthDataSpy.and.returnValue({operationType: 'signIn', providerId: 'twitter.com'})
      getRedirectResultSpy.and.callFake(() => Promise.reject({code: 'auth/unexpected'}))
      service.checkForRedirect('signIn').catch(err => rejected = err);
      tick();
      expect(rejected.code).toBe('auth/unexpected');
    }))
  })

  describe('popup(providerId, operationType, user?)', () => {
    const success = {fake: 'event'}
    const popupResult = {
      user: {uid: '123'},
      credential: {providerId: 'twitter.com'}
    }
    const auth = {
      signInWithPopup: () => Promise.resolve(popupResult)
    }
    const user  = {
      linkWithPopup: () => Promise.resolve(popupResult),
      reauthenticateWithPopup: () => Promise.resolve(popupResult),
    }

    const provider = {providerId: 'twitter.com'}
    const authService = {auth: auth, getProviderById: () => Promise.resolve(provider) };
    let service: OauthService;
    let signInWithPopupSpy;
    let linkWithPopupSpy;
    let reauthenticateWithPopupSpy;
    let getProviderByIdSpy;
    let resolved, rejected;
    beforeEach(() => {
      signInWithPopupSpy = spyOn(auth, 'signInWithPopup').and.callThrough();
      linkWithPopupSpy = spyOn(user, 'linkWithPopup').and.callThrough();
      reauthenticateWithPopupSpy = spyOn(user, 'reauthenticateWithPopup').and.callThrough();
      getProviderByIdSpy = spyOn(authService, 'getProviderById').and.callThrough();
      TestBed.overrideProvider(SfaService, {useValue: authService});
      service = TestBed.get(OauthService);
      spyOn(service, 'getOAuthExtendedError').and.callFake((err) => Promise.resolve(err));
      spyOn(service, 'handleOAuthSuccess').and.callFake(() => Promise.resolve(success));
      resolved = undefined;
      rejected = undefined;
    })

    it('should resolve for signIn', fakeAsync(() => {
      service.popup('twitter.com', 'signIn').then(result => resolved = result);
      tick();
      expect(resolved).toBe(success);
    }))
    it('should reject for signIn if api signInWithPopup fails', fakeAsync(() => {
      signInWithPopupSpy.and.callFake(() => Promise.reject({code: 'auth/unexpected'}))
      service.popup('twitter.com', 'signIn').catch(result => rejected = result);
      tick();
      expect(rejected.code).toBe('auth/unexpected');
    }))
    it('should resolve for link', fakeAsync(() => {
      service.popup('twitter.com', 'link', user).then(result => resolved = result);
      tick();
      expect(resolved).toBe(success);
    }))
    it('should reject for link if user missing', fakeAsync(() => {
      service.popup('twitter.com', 'link').catch(result => rejected = result);
      tick();
      expect(rejected.code).toBe('sfa/no-user');
    }))
    it('should reject for link if api linkWithPopup fails', fakeAsync(() => {
      linkWithPopupSpy.and.callFake(() => Promise.reject({code: 'auth/unexpected'}))
      service.popup('twitter.com', 'link', user).catch(result => rejected = result);
      tick();
      expect(rejected.code).toBe('auth/unexpected');
    }))
    it('should resolve for reauthenticate', fakeAsync(() => {
      service.popup('twitter.com', 'reauthenticate', user).then(result => resolved = result);
      tick();
      expect(resolved).toBe(success);
    }))
    it('should reject for reauthenticate if user missing', fakeAsync(() => {
      service.popup('twitter.com', 'reauthenticate').catch(result => rejected = result);
      tick();
      expect(rejected.code).toBe('sfa/no-user');
    }))
    it('should reject for reauthenticate if api reauthenticateWithPopup fails', fakeAsync(() => {
      reauthenticateWithPopupSpy.and.callFake(() => Promise.reject({code: 'auth/unexpected'}))
      service.popup('twitter.com', 'reauthenticate', user).catch(result => rejected = result);
      tick();
      expect(rejected.code).toBe('auth/unexpected');
    }))
  })

  describe('redirect(providerId, operationType, user?)', () => {
    const user = {
      linkWithRedirect: () => Promise.resolve(),
      reauthenticateWithRedirect: () => Promise.resolve(),
    }
    const auth = {
      signInWithRedirect: () => Promise.resolve()
    }
    const provider = {providerId: 'fooo'};
    const authService = {auth: auth, getProviderById: () => Promise.resolve(provider) };
    let getProviderByIdSpy;
    let signInWithRedirectSpy;
    let linkWithRedirectSpy;
    let reauthenticateWithRedirectSpy;
    let service: OauthService;
    let resolved, rejected;

    beforeEach(() => {
      signInWithRedirectSpy = spyOn(auth, 'signInWithRedirect').and.callThrough();
      linkWithRedirectSpy = spyOn(user, 'linkWithRedirect').and.callThrough();
      reauthenticateWithRedirectSpy = spyOn(user, 'reauthenticateWithRedirect').and.callThrough();
      getProviderByIdSpy = spyOn(authService, 'getProviderById').and.callThrough();
      TestBed.overrideProvider(SfaService, {useValue: authService});
      service = TestBed.get(OauthService);
      spyOn(service, 'getOAuthExtendedError').and.callFake((err) => Promise.resolve(err));
      resolved = undefined;
      rejected = undefined;
    })
    it('should resolve for signIn', fakeAsync(() => {
      service.redirect('twitter.com', 'signIn').then(result => resolved = true);
      tick();
      expect(resolved).toBe(true);
    }))
    it('should reject for signIn if api signInWithRedirect fails', fakeAsync(() => {
      signInWithRedirectSpy.and.callFake(() => Promise.reject({code: 'auth/unexpected'}))
      service.redirect('twitter.com', 'signIn').catch(result => rejected = result);
      tick();
      expect(rejected.code).toBe('auth/unexpected');
    }))
    it('should resolve for link', fakeAsync(() => {
      service.redirect('twitter.com', 'link', user).then(result => resolved = true);
      tick();
      expect(resolved).toBe(true);
    }))
    it('should reject for link if user missing', fakeAsync(() => {
      service.redirect('twitter.com', 'link').catch(result => rejected = result);
      tick();
      expect(rejected.code).toBe('sfa/no-user');
    }))
    it('should reject for link if api linkWithRedirect fails', fakeAsync(() => {
      linkWithRedirectSpy.and.callFake(() => Promise.reject({code: 'auth/unexpected'}))
      service.redirect('twitter.com', 'link', user).catch(result => rejected = result);
      tick();
      expect(rejected.code).toBe('auth/unexpected');
    }))
    it('should resolve for reauthenticate', fakeAsync(() => {
      service.redirect('twitter.com', 'reauthenticate', user).then(result => resolved = true);
      tick();
      expect(resolved).toBe(true);
    }))
    it('should reject for reauthenticate if user missing', fakeAsync(() => {
      service.redirect('twitter.com', 'reauthenticate').catch(result => rejected = result);
      tick();
      expect(rejected.code).toBe('sfa/no-user');
    }))
    it('should reject for reauthenticate if api reauthenticateWithRedirect fails', fakeAsync(() => {
      reauthenticateWithRedirectSpy.and.callFake(() => Promise.reject({code: 'auth/unexpected'}))
      service.redirect('twitter.com', 'reauthenticate', user).catch(result => rejected = result);
      tick();
      expect(rejected.code).toBe('auth/unexpected');
    }))
  })

  describe('the public api', () => {
    let service: OauthService;
    const user = {};
    beforeEach(() => {
      service = TestBed.get(OauthService);
      spyOn(service, 'redirect').and.returnValue(null);
      spyOn(service, 'checkForRedirect').and.returnValue(null);
      spyOn(service, 'popup').and.returnValue(null);
    });
    describe('signInWithRedirect(providerId)', () => {
      it('should call redirect correctly', () => {
        service.signInWithRedirect('twitter.com');
        expect(service.redirect).toHaveBeenCalledWith('twitter.com', 'signIn');
      })
    })
    describe('linkWithRedirect(providerId, user)', () => {
      it('should call redirect correctly', () => {
        service.linkWithRedirect('twitter.com', user);
        expect(service.redirect).toHaveBeenCalledWith('twitter.com', 'link', user);
      })
    })
    describe('reauthenticateWithRedirect(providerId, user)', () => {
      it('should call redirect correctly', () => {
        service.reauthenticateWithRedirect('twitter.com', user);
        expect(service.redirect).toHaveBeenCalledWith('twitter.com', 'reauthenticate', user);
      })
    })
    describe('checkForSignInRedirect()', () => {
      it('should call checkForRedirect correctly', () => {
        service.checkForSignInRedirect();
        expect(service.checkForRedirect).toHaveBeenCalledWith('signIn');
      })
    })
    describe('checkForLinkRedirect()', () => {
      it('should call redirect correctly', () => {
        service.checkForLinkRedirect();
        expect(service.checkForRedirect).toHaveBeenCalledWith('link');
      })
    })
    describe('checkForReauthenticateRedirect()', () => {
      it('should call redirect correctly', () => {
        service.checkForReauthenticateRedirect();
        expect(service.checkForRedirect).toHaveBeenCalledWith('reauthenticate');
      })
    })

    describe('signInWithPopup(providerId)', () => {
      it('should call popup correctly', () => {
        service.signInWithPopup('twitter.com');
        expect(service.popup).toHaveBeenCalledWith('twitter.com', 'signIn');
      })
    })
    describe('linkWithPopup(providerId, user)', () => {
      it('should call redirect correctly', () => {
        service.linkWithPopup('twitter.com', user);
        expect(service.popup).toHaveBeenCalledWith('twitter.com', 'link', user);
      })
    })
    describe('reauthenticateWithPopup(providerId, user)', () => {
      it('should call redirect correctly', () => {
        service.reauthenticateWithPopup('twitter.com', user);
        expect(service.popup).toHaveBeenCalledWith('twitter.com', 'reauthenticate', user);
      })
    })
  })

});
