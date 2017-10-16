import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import { SimpleFirebaseAuthService } from '../simple-firebase-auth.service';
import {
  AuthUserEvent,
  OAuthMethod
} from '../simple-firebase-auth'

export class StoredOauthData {
  providerId: string;
  operationType: 'signIn'| 'link' | 'reauthenticate'
}

@Injectable()
export class OauthService {

  static REDIRECT_KEY = 'simple-firebase-auth-oauth-redirect';

  savedPopupPromise: Promise<AuthUserEvent|null> = null;

  constructor(
    private authService: SimpleFirebaseAuthService
  ) { }

  signInWithRedirect(providerId: string): Promise<void> {
    return this.redirect(providerId, 'signIn');
  }
  linkWithRedirect(providerId: string, user: firebase.User): Promise<void> {
    return this.redirect(providerId, 'link', user);
  }
  reauthenticateWithRedirect(providerId: string, user: firebase.User): Promise<void> {
    return this.redirect(providerId, 'reauthenticate', user);
  }

  checkForSignInRedirect(): Promise<AuthUserEvent|null> {
    return this.checkForRedirect('signIn');
  }
  checkForLinkRedirect(): Promise<AuthUserEvent|null> {
    return this.checkForRedirect('link');
  }
  checkForReauthenticateRedirect(): Promise<AuthUserEvent|null> {
    return this.checkForRedirect('reauthenticate');
  }
  signInWithPopup(providerId: string): Promise<AuthUserEvent|null> {
    return this.popup(providerId, 'signIn');
  }
  linkWithPopup(providerId: string, user: firebase.User): Promise<AuthUserEvent|null> {
    return this.popup(providerId, 'link', user);
  }
  reauthenticateWithPopup(providerId: string, user: firebase.User): Promise<AuthUserEvent|null> {
    return this.popup(providerId, 'reauthenticate', user);
  }

  unlink(providerId: string, user: firebase.User): Promise<AuthUserEvent> {
    return new Promise((resolve, reject) => {
      user.unlink(providerId)
        .then(() => {
          const event: AuthUserEvent = {
            user: user,
            providerId: providerId
          }
          this.authService.onProviderUnlinkedNext(event);
          resolve(event);
        })
        .catch((error: firebase.FirebaseError) => {
          reject(this.getOAuthExtendedError(error, providerId));
        })
    })
  }




  private setStoredOAuthData(data: StoredOauthData) {
    sessionStorage.setItem(OauthService.REDIRECT_KEY, JSON.stringify(data));
  }
  private getStoredOAuthData(): StoredOauthData|null {
    const str = sessionStorage.getItem(OauthService.REDIRECT_KEY);
    sessionStorage.removeItem(OauthService.REDIRECT_KEY);
    if (! str){
      return null;
    }
    try {
      return JSON.parse(str);
    } catch (error) {
      return null;
    }
  }

  private getOAuthExtendedError(error: any, providerId: string): Promise<any> {
    return new Promise(resolve => {
      const extendedError:any = _.clone(error);
      extendedError.providerId = providerId;
      switch(error.code) {
        case 'auth/account-exists-with-different-credential':
          this.authService.auth.fetchProvidersForEmail(error.email)
            .then(providerIds => {
              extendedError.providerIdsForEmail = providerIds;
              resolve(extendedError);
            });
          break;
        default:
          resolve(extendedError);
          break;
      }
    })

  }

  private redirect(providerId: string, operationType: 'signIn'| 'link' | 'reauthenticate', user?: firebase.User): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.authService.getProviderById(providerId)
        .then((provider: firebase.auth.AuthProvider) => {
          this.setStoredOAuthData({providerId: provider.providerId, operationType: operationType});
          switch(operationType) {
            case 'signIn': return this.authService.auth.signInWithRedirect(provider);
            case 'link': return user.linkWithRedirect(provider);
            case 'reauthenticate': return user.reauthenticateWithRedirect(provider);
          }

        })
        .then(resolve)
        .catch((error: firebase.FirebaseError) => {
          reject(this.getOAuthExtendedError(error, providerId));
        });
    })
  }



  private handleOAuthSuccess(result: firebase.auth.UserCredential, operationType: 'signIn'| 'link' | 'reauthenticate'): Promise<AuthUserEvent|null>{
    return new Promise(resolve => {
      if (result.user && result.credential) {
        const event: AuthUserEvent = {
          user: result.user,
          credential: result,
          providerId: result.credential.providerId
        };
        switch(operationType) {
          case 'signIn':
            this.authService.onSignedInNext(event);
            break;
          case 'link':
            this.authService.onProviderLinkedNext(event)
            break;
          case 'reauthenticate':
            break;
        }
        resolve(event);
      } else {
        resolve(null);
      }
    })
  }

  private checkForRedirect(operationType: 'signIn'| 'link' | 'reauthenticate'): Promise<AuthUserEvent|null> {
    return new Promise((resolve, reject) => {
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
          })

        })
    })
  }



  private popup(providerId: string, operationType: 'signIn'| 'link' | 'reauthenticate', user?: firebase.User): Promise<AuthUserEvent|null> {
    return new Promise((resolve, reject) => {
      this.authService.getProviderById(providerId)
        .then((provider: firebase.auth.AuthProvider) => {
          switch(operationType) {
            case 'signIn': return this.authService.auth.signInWithPopup(provider);
            case 'link': return user.linkWithPopup(provider);
            case 'reauthenticate': return user.reauthenticateWithPopup(provider);
          }
        })
        .then((result: firebase.auth.UserCredential) => {
          return this.handleOAuthSuccess(result, operationType);
        })
        .then(resolve)
        .catch((error: firebase.FirebaseError) => {
          this.getOAuthExtendedError(error, providerId).then((result) => {
            reject(result);
          })
        })
    });
  }
}
