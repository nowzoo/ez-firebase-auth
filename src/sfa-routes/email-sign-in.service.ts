import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRouteSnapshot, Router, NavigationExtras } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase';
import * as _ from '../utils/lodash-funcs';
import {
  SUPPORTED_PROVIDERS,
  LOCAL_PERSISTENCE_DISABLED_STORAGE_KEY,
  SfaOptions,  SfaProviderLabels,
  IAuthEmailChangedEvent, IAuthUserEvent,
  OAuthMethod
} from '../sfa/sfa';
import { SfaService } from '../sfa/sfa.service';

@Injectable()
export class EmailSignInService {
  constructor (
    private sfaService: SfaService
  ) {}

  public emailHasPasswordProvider(email: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sfaService.auth.fetchProvidersForEmail(email)
        .then((providerIds: string[]) => {
          if (providerIds.length === 0) {
            return resolve(false);
          }
          if (_.includes(providerIds, 'password')) {
            return resolve(true);
          }
          return reject({
            code: 'sfa/no-password-for-email',
            message: 'The account wth that email does not have a password'
          });
        })
        .catch(reject);
    });
  }

  public emailSignIn(email: string, password: string, name?: string): Promise<firebase.User> {
    return new Promise((resolve, reject) => {
        const providerId = 'password';
        let accountExists: boolean;
        let user: firebase.User;
        this.sfaService.getProviderById(providerId)
          .then(() => {
            return this.emailHasPasswordProvider(email);
          })
          .then((result: boolean) => {
            accountExists = result;
            if (! accountExists) {
              return this.sfaService.auth.createUserWithEmailAndPassword(email, password);
            }
          })
          .then(() => {
            return this.sfaService.auth.signInWithEmailAndPassword(email, password);
          })
          .then((result: firebase.User) => {
            user = result;
            if ((! accountExists) && this.sfaService.requireDisplayName) {
              return user.updateProfile({displayName: name as string, photoURL: null});
            }
          })
          .then(() => {
            if ((! accountExists) && this.sfaService.sendEmailVerificationLink) {
              return user.sendEmailVerification();
            }
          })
          .then(() => {
            return user.reload();
          })
          .then(() => {
            this.sfaService.onSignedIn({
              user: user,
              providerId: providerId
            });
            resolve(user);
          })
          .catch(reject);
      });
    }



}
