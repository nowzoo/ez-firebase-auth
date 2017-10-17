import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRouteSnapshot, Router, NavigationExtras } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase';
import * as _ from './lodash-funcs';

import { SUPPORTED_PROVIDERS, LOCAL_PERSISTENCE_DISABLED_STORAGE_KEY } from './constants';
import { SimpleFirebaseAuthOptions } from './simple-firebase-auth-options.class';
import { SimpleFirebaseAuthProviderLabels } from './simple-firebase-auth-provider-labels.class';
import { IAuthEmailChangedEvent } from './auth-email-changed-event.interface';
import { IAuthUserEvent } from './auth-user-event.interface';
import { OAuthMethod } from './o-auth-method.enum';

@Injectable()
export class SimpleFirebaseAuthService {

  private settableOAuthMethod: OAuthMethod|null = null;
  private persistenceLocal$: BehaviorSubject<boolean>;
  private pAuthRedirectCancelled: boolean = false;
  private onSignedIn$: Subject<IAuthUserEvent>;
  private onSignedOut$: Subject<void>;
  private onProviderLinked$: Subject<IAuthUserEvent>;
  private onProviderUnlinked$: Subject<IAuthUserEvent>;
  private onEmailChanged$: Subject<IAuthEmailChangedEvent>;
  private onRoute$: Subject<string>;

  constructor(
    protected options: SimpleFirebaseAuthOptions,
    protected router: Router,
    protected afAuth: AngularFireAuth
  ) {
    this.persistenceLocal$ =  new BehaviorSubject(
      localStorage.getItem(LOCAL_PERSISTENCE_DISABLED_STORAGE_KEY) === 'yes' ? false : true
    );
    this.onSignedIn$ = new Subject();
    this.onSignedOut$ = new Subject<void>();
    this.onProviderLinked$  = new Subject();
    this.onProviderUnlinked$  = new Subject();
    this.onEmailChanged$  = new Subject();
    this.onRoute$  = new Subject();
  }

  get auth(): firebase.auth.Auth {
    return this.afAuth.auth;
  }
  get authState(): Observable<firebase.User|null> {
    return this.afAuth.authState;
  }
  get applicationLabel(): string {
    return this.options.applicationLabel;
  }
  /**
   * The providerIds from the passed configuration.
   * @return {string[]} [description]
   */
  get configuredProviderIds(): string[] {
    return _.filter(this.options.configuredProviderIds, (id) => {
      return _.includes(SUPPORTED_PROVIDERS, id);
    });
  }

  get oAuthProviderIds(): string[] {
    return _.filter(this.configuredProviderIds, (id) => {
      return id !== 'password' && id !== 'phone';
    });
  }

  public getProviderById(id: string): Promise<firebase.auth.AuthProvider> {
    return new Promise((resolve, reject) => {
      if (! _.includes(this.configuredProviderIds, id)) {
        return reject({code: 'sfa/provider-not-configured'});
      }
      const customProvider = _.find(this.options.customizedProviders, {providerId: id});
      if (customProvider) {
        return resolve(customProvider);
      }
      switch (id) {
        case 'password': return resolve(new firebase.auth.EmailAuthProvider());
        case 'twitter.com': return resolve(new firebase.auth.TwitterAuthProvider());
        case 'facebook.com': return resolve(new firebase.auth.FacebookAuthProvider());
        case 'google.com': return resolve(new firebase.auth.GoogleAuthProvider());
        case 'github.com': return resolve(new firebase.auth.GithubAuthProvider());
        default: return reject({code: 'sfa/provider-not-configured'});
      }
    });
  }

  /**
   * Whether or not to require a "name" on email/password sign up. Defaults to true.
   * @return {boolean}
   */
  get requireDisplayName(): boolean {
    return this.options.requireDisplayName !== false;
  }

  /**
   * Whether or not to require a "I've read the terms of service" check on email/password sign up. Defaults to true.
   * @return {boolean}
   */
  get requireTos(): boolean {
    return this.options.requireTos !== false;
  }

  /**
   * Whether or not to send an email verification on email/password sign up. Defaults to true.
   * @return {boolean}
   */
  get sendEmailVerificationLink(): boolean {
    return this.options.sendEmailVerificationLink !== false;
  }

  get oAuthMethod(): OAuthMethod {
    if (this.settableOAuthMethod) {
      return this.settableOAuthMethod;
    }
    if (_.has(this.options, 'oAuthMethod') && this.options.oAuthMethod) {
      return this.options.oAuthMethod;
    }
    return OAuthMethod.redirect;
  }

  set oAuthMethod(method: OAuthMethod) {
    this.settableOAuthMethod = method;
  }

  get rootSlug(): string {
    return this.options.rootSlug;
  }

  get providerLabels(): SimpleFirebaseAuthProviderLabels {
    const defaultLabels = new SimpleFirebaseAuthProviderLabels();
    const passed = this.options.providerLabels || {};
    return _.assign({}, defaultLabels, passed);
  }

  get persistenceLocal(): Observable<boolean> {
    return this.persistenceLocal$.asObservable();
  }
  public setPersistenceLocal(b: boolean): Promise<void> {
    return new Promise<void>((resolve) => {
      const persistence: firebase.auth.Auth.Persistence = b ?
        firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
      this.auth.setPersistence(persistence)
        .then(() => {
          if (b) {
            localStorage.removeItem(LOCAL_PERSISTENCE_DISABLED_STORAGE_KEY);
          } else {
            localStorage.setItem(LOCAL_PERSISTENCE_DISABLED_STORAGE_KEY, 'yes');
          }
          this.persistenceLocal$.next(b);
          resolve();
        });
    });
  }

  get authRedirectCancelled(): boolean {
    return this.pAuthRedirectCancelled;
  }
  set authRedirectCancelled(cancel: boolean) {
    this.pAuthRedirectCancelled = cancel;
  }

  get onSignedIn(): Observable<IAuthUserEvent> {
    return this.onSignedIn$.asObservable();
  }
  public onSignedInNext(event: IAuthUserEvent) {
    this.authRedirectCancelled = false;
    this.onSignedIn$.next(event);
    if (! this.authRedirectCancelled) {
      this.navigate('account');
    }
  }
  get onSignedOut(): Observable<void> {
    return this.onSignedOut$.asObservable();
  }
  public onSignedOutNext() {
    this.authRedirectCancelled = false;
    this.onSignedOut$.next();
    if (! this.authRedirectCancelled) {
      this.navigate('sign-in');
    }
  }

  get onProviderLinked(): Observable<IAuthUserEvent> {
    return this.onProviderLinked$.asObservable();
  }
  public onProviderLinkedNext(event: IAuthUserEvent) {
    this.onProviderLinked$.next(event);
  }
  get onProviderUnlinked(): Observable<IAuthUserEvent> {
    return this.onProviderUnlinked$.asObservable();
  }
  public onProviderUnlinkedNext(event: IAuthUserEvent) {
    this.onProviderUnlinked$.next(event);
  }

  get onEmailChanged(): Observable<IAuthEmailChangedEvent> {
    return this.onEmailChanged$.asObservable();
  }
  public onEmailChangedNext(event: IAuthEmailChangedEvent) {
    this.onEmailChanged$.next(event);
  }
  get onRoute(): Observable<string> {
    return this.onRoute$.asObservable();
  }
  public onRouteNext(slug: string) {
    this.onRoute$.next(slug);
  }

  public routerLink(slug?: string): string[] {
    const commands = ['/' + this.rootSlug];
    if (slug) {
      commands.push(slug);
    }
    return commands;
  }
  public navigate(slug?: string, extras?: NavigationExtras ): Promise<boolean> {
    return this.router.navigate(this.routerLink(slug), extras);
  }

public emailSignIn(email: string, password: string, name?: string): Promise<firebase.User> {
    return new Promise((resolve, reject) => {
      const providerId = 'password';
      let accountExists: boolean;
      let user: firebase.User;
      this.getProviderById(providerId)
        .then(() => {
          return this.auth.fetchProvidersForEmail(email);
        })
        .then((providerIds: string[]) => {
          return new Promise((resolve2, reject2) => {
            if (providerIds.length === 0) {
              return resolve2(false);
            }
            if (_.includes(providerIds, providerId)) {
              return resolve2(true);
            }
            return reject2({
              code: 'sfa/no-password-for-user',
              message: 'The account wth that email does not have a password'
            });
          });
        })
        .then((result: boolean) => {
          accountExists = result;
          if (! accountExists) {
            return this.auth.createUserWithEmailAndPassword(email, password);
          }
        })
        .then(() => {
          return this.auth.signInWithEmailAndPassword(email, password);
        })
        .then((result: firebase.User) => {
          user = result;
          if ((! accountExists) && this.requireDisplayName) {
            return user.updateProfile({displayName: name as string, photoURL: null});
          }
        })
        .then(() => {
          if ((! accountExists) && this.sendEmailVerificationLink) {
            return user.sendEmailVerification();
          }
        })
        .then(() => {
          return user.reload();
        })
        .then(() => {
          this.authRedirectCancelled = false;
          this.onSignedIn$.next({
            user: user,
            providerId: providerId
          });
          if (! this.authRedirectCancelled) {
            this.router.navigate(['/', this.rootSlug, 'account']);
          }
          resolve(user);
        })
        .catch(reject);
    });
  }

}
