import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import * as _ from '../lodash-funcs';
import { SimpleFirebaseAuthService } from '../simple-firebase-auth.service';
import { OAuthMethod } from '../o-auth-method.enum';
import { IAuthUserEvent } from '../auth-user-event.interface';
import { StoredOauthData } from './stored-oauth-data.class';

@Injectable()
export class OauthService {

  protected static REDIRECT_KEY = 'simple-firebase-auth-oauth-redirect';

  public savedPopupPromise: Promise<IAuthUserEvent | null> | null = null;

  constructor(
    protected authService: SimpleFirebaseAuthService
  ) { }

  public signInWithRedirect(providerId: string): Promise<void> {
    return this.redirect(providerId, 'signIn');
  }
  public linkWithRedirect(providerId: string, user: firebase.User): Promise<void> {
    return this.redirect(providerId, 'link', user);
  }
  public reauthenticateWithRedirect(providerId: string, user: firebase.User): Promise<void> {
    return this.redirect(providerId, 'reauthenticate', user);
  }

  public checkForSignInRedirect(): Promise<IAuthUserEvent |null> {
    return this.checkForRedirect('signIn');
  }
  public checkForLinkRedirect(): Promise<IAuthUserEvent | null> {
    return this.checkForRedirect('link');
  }
  public checkForReauthenticateRedirect(): Promise<IAuthUserEvent | null> {
    return this.checkForRedirect('reauthenticate');
  }
  public signInWithPopup(providerId: string): Promise<IAuthUserEvent | null> {
    return this.popup(providerId, 'signIn');
  }
  public linkWithPopup(providerId: string, user: firebase.User): Promise<IAuthUserEvent | null> {
    return this.popup(providerId, 'link', user);
  }
  public reauthenticateWithPopup(providerId: string, user: firebase.User): Promise<IAuthUserEvent | null> {
    return this.popup(providerId, 'reauthenticate', user);
  }

  public unlink(providerId: string, user: firebase.User): Promise<IAuthUserEvent> {
    return new Promise((resolve, reject) => {
      user.unlink(providerId)
        .then(() => {
          const event: IAuthUserEvent = {
            user: user,
            providerId: providerId
          };
          this.authService.onProviderUnlinkedNext(event);
          resolve(event);
        })
        .catch((error: firebase.FirebaseError) => {
          reject(this.getOAuthExtendedError(error, providerId));
        });
    });
  }

  protected setStoredOAuthData(data: StoredOauthData) {
    sessionStorage.setItem(OauthService.REDIRECT_KEY, JSON.stringify(data));
  }

  protected getStoredOAuthData(): StoredOauthData|null {
    const str = sessionStorage.getItem(OauthService.REDIRECT_KEY);
    sessionStorage.removeItem(OauthService.REDIRECT_KEY);
    if (! str) {
      return null;
    }
    try {
      return JSON.parse(str);
    } catch (error) {
      return null;
    }
  }

  protected getOAuthExtendedError(error: any, providerId: string): Promise<any> {
    return new Promise((resolve) => {
      const extendedError: any = _.clone(error);
      extendedError.providerId = providerId;
      switch (error.code) {
        case 'auth/account-exists-with-different-credential':
          this.authService.auth.fetchProvidersForEmail(error.email)
            .then((providerIds) => {
              extendedError.providerIdsForEmail = providerIds;
              resolve(extendedError);
            });
          break;
        default:
          resolve(extendedError);
          break;
      }
    });

  }

  protected redirect(
    providerId: string,
    operationType: 'signIn'| 'link' | 'reauthenticate',
    user?: firebase.User): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.authService.getProviderById(providerId)
        .then((provider: firebase.auth.AuthProvider) => {
          this.setStoredOAuthData({providerId: provider.providerId, operationType: operationType});
          switch (operationType) {
            case 'signIn': return this.authService.auth.signInWithRedirect(provider);
            case 'link':
              if (! user) {
                throw(new Error('missing user param'));
              }
              return user.linkWithRedirect(provider);
            case 'reauthenticate':
              if (! user) {
                throw(new Error('missing user param'));
              }
              return user.reauthenticateWithRedirect(provider);
          }

        })
        .then(resolve)
        .catch((error: firebase.FirebaseError) => {
          reject(this.getOAuthExtendedError(error, providerId));
        });
    });
  }

  protected handleOAuthSuccess(
    result: firebase.auth.UserCredential,
    operationType: 'signIn'| 'link' | 'reauthenticate'): Promise<IAuthUserEvent|null> {
    return new Promise<IAuthUserEvent|null>((resolve: any) => {
      if (result.user && result.credential) {
        const event: IAuthUserEvent = {
          user: result.user,
          credential: result,
          providerId: result.credential.providerId
        };
        switch (operationType) {
          case 'signIn':
            this.authService.onSignedInNext(event);
            break;
          case 'link':
            this.authService.onProviderLinkedNext(event);
            break;
          case 'reauthenticate':
            break;
        }
        resolve(event);
      } else {
        resolve(null);
      }
    });
  }

  protected checkForRedirect(operationType: 'signIn'| 'link' | 'reauthenticate'): Promise<IAuthUserEvent | null> {
    return new Promise<IAuthUserEvent|null>((resolve: any, reject: any) => {
      const data = this.getStoredOAuthData();
      if (! data) {
        return resolve(null);
      }
      if (data.operationType !== operationType) {
        return resolve(null);
      }
      this.authService.auth.getRedirectResult()
        .then((result: firebase.auth.UserCredential) => {
          return this.handleOAuthSuccess(result, operationType);
        })
        .then(resolve)
        .catch((error: firebase.FirebaseError) => {
          this.getOAuthExtendedError(error, data.providerId).then((result) => {
            reject(result);
          });

        });
    });
  }

  protected popup(
    providerId: string,
    operationType: 'signIn'| 'link' | 'reauthenticate',
    user?: firebase.User): Promise<IAuthUserEvent|null> {
    return new Promise<IAuthUserEvent | null>((resolve, reject) => {
      this.authService.getProviderById(providerId)
        .then((provider: firebase.auth.AuthProvider) => {
          switch (operationType) {
            case 'signIn': return this.authService.auth.signInWithPopup(provider);
            case 'link':
              if (! user) {
                throw(new Error('missing user param'));
              }
              return user.linkWithPopup(provider);
            case 'reauthenticate':
              if (! user) {
                throw(new Error('missing user param'));
              }
              return user.reauthenticateWithPopup(provider);
          }
        })
        .then((result: firebase.auth.UserCredential) => {
          return this.handleOAuthSuccess(result, operationType);
        })
        .then(resolve)
        .catch((error: firebase.FirebaseError) => {
          this.getOAuthExtendedError(error, providerId).then((result) => {
            reject(result);
          });
        });
    });
  }
}
