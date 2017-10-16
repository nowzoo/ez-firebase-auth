import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRouteSnapshot, Router, NavigationExtras } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase';
import * as _ from './lodash-funcs';



import {SUPPORTED_PROVIDERS, LOCAL_PERSISTENCE_DISABLED_STORAGE_KEY} from './constants'
import { SimpleFirebaseAuthOptions } from './simple-firebase-auth-options.class';
import { SimpleFirebaseAuthProviderLabels } from './simple-firebase-auth-provider-labels.class';
import { AuthEmailChangedEvent } from './auth-email-changed-event.interface';
import { AuthUserEvent } from './auth-user-event.interface';
import { OAuthMethod } from './o-auth-method.enum';





@Injectable()
export class SimpleFirebaseAuthService {

  constructor(
    private options: SimpleFirebaseAuthOptions,
    private router: Router,
    private afAuth: AngularFireAuth
  ) {

  }

  //*********** AUTH and AUTHSTATE *****************//
  get auth(): firebase.auth.Auth {
    return this.afAuth.auth;
  }
  get authState(): Observable<firebase.User|null> {
    return this.afAuth.authState;
  }

  //*********** OPTIONS *****************//

  get applicationLabel(): string {
    return this.options.applicationLabel;
  }
  /**
   * The providerIds from the passed configuration.
   * @return {string[]} [description]
   */
  get configuredProviderIds(): string[] {
    return _.filter(this.options.configuredProviderIds, id => {
      return _.includes(SUPPORTED_PROVIDERS, id);
    })
  }

  get oAuthProviderIds(): string[] {
    return _.filter(this.configuredProviderIds, id => {
      return id !== 'password' && id !== 'phone';
    })
  }

  getProviderById(id: string): Promise<firebase.auth.AuthProvider> {
    return new Promise((resolve, reject) => {
      if (! _.includes(this.configuredProviderIds, id)){
        return reject({code: 'sfa/provider-not-configured'});
      }
      const customProvider = _.find(this.options.customizedProviders, {providerId: id});
      if (customProvider) {
        return resolve(customProvider);
      }
      switch(id) {
        case 'password': return resolve(new firebase.auth.EmailAuthProvider());
        case 'twitter.com': return resolve(new firebase.auth.TwitterAuthProvider());
        case 'facebook.com': return resolve(new firebase.auth.FacebookAuthProvider());
        case 'google.com': return resolve(new firebase.auth.GoogleAuthProvider());
        case 'github.com': return resolve(new firebase.auth.GithubAuthProvider());
        default: return reject({code: 'sfa/provider-not-configured'});
      }

    })
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

  private _settableOAuthMethod: OAuthMethod|null = null;
  get oAuthMethod(): OAuthMethod {
    if (this._settableOAuthMethod){
      return this._settableOAuthMethod;
    }
    if (_.has(this.options, 'oAuthMethod') && this.options.oAuthMethod){
      return this.options.oAuthMethod;
    }
    return OAuthMethod.redirect;
  }

  set oAuthMethod(method: OAuthMethod) {
    this._settableOAuthMethod = method;
  }

  get rootSlug(): string {
    return this.options.rootSlug;
  }

  get providerLabels(): SimpleFirebaseAuthProviderLabels {
    const defaultLabels = new SimpleFirebaseAuthProviderLabels();
    const passed = this.options.providerLabels || {};
    return _.assign({}, defaultLabels, passed);
  }


  //********** PERSISTENCE ************//

  private _persistenceLocal: BehaviorSubject<boolean> = new BehaviorSubject(
    localStorage.getItem(LOCAL_PERSISTENCE_DISABLED_STORAGE_KEY) === 'yes' ? false : true
  );
  get persistenceLocal(): Observable<boolean> {
    return this._persistenceLocal.asObservable();
  }
  setPersistenceLocal(b: boolean): Promise<void> {
    return new Promise<void>(resolve => {
      const persistence: firebase.auth.Auth.Persistence = b ?
        firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
      this.auth.setPersistence(persistence)
        .then(() => {
          if (b) {
            localStorage.removeItem(LOCAL_PERSISTENCE_DISABLED_STORAGE_KEY);
          } else {
            localStorage.setItem(LOCAL_PERSISTENCE_DISABLED_STORAGE_KEY, 'yes');
          }
          this._persistenceLocal.next(b);
          resolve();
        })
    })
  }



  //*********** EVENTS *****************//

  private _authRedirectCancelled: boolean = false;
  get authRedirectCancelled(): boolean {
    return this._authRedirectCancelled;
  }
  set authRedirectCancelled(cancel: boolean) {
    this._authRedirectCancelled = cancel;
  }

  private _onSignedIn: Subject<AuthUserEvent> = new Subject();
  get onSignedIn(): Observable<AuthUserEvent> {
    return this._onSignedIn.asObservable();
  }
  onSignedInNext(event: AuthUserEvent) {
    this.authRedirectCancelled = false;
    this._onSignedIn.next(event);
    if (! this.authRedirectCancelled) {
      this.navigate('account');
    }
  }


  private onSignedOut$: Subject<void> = new Subject<void>();
  get onSignedOut(): Observable<void> {
    return this.onSignedOut$.asObservable();
  }
  onSignedOutNext() {
    this.authRedirectCancelled = false;
    this.onSignedOut$.next();
    console.log(this.authRedirectCancelled)
    if (! this.authRedirectCancelled) {
      this.navigate('sign-in');
    }
  }


  private _onProviderLinked: Subject<AuthUserEvent> = new Subject();
  get onProviderLinked(): Observable<AuthUserEvent> {
    return this._onProviderLinked.asObservable();
  }
  onProviderLinkedNext(event: AuthUserEvent) {
    this._onProviderLinked.next(event);
  }


  private onProviderUnlinked$: Subject<AuthUserEvent> = new Subject();
  get onProviderUnlinked(): Observable<AuthUserEvent> {
    return this.onProviderUnlinked$.asObservable();
  }
  onProviderUnlinkedNext(event: AuthUserEvent){
    this.onProviderUnlinked$.next(event)
  }

  private onEmailChanged$: Subject<AuthEmailChangedEvent> = new Subject();
  get onEmailChanged(): Observable<AuthEmailChangedEvent> {
    return this.onEmailChanged$.asObservable();
  }
  onEmailChangedNext(event: AuthEmailChangedEvent){
    this.onEmailChanged$.next(event)
  }


  private onRoute$: Subject<string> = new Subject();
  get onRoute(): Observable<string> {
    return this.onRoute$.asObservable();
  }
  public onRouteNext(slug: string) {
    this.onRoute$.next(slug);
  }


  //*********** ROUTER *****************//

  routerLink(slug?: string) {
    const commands = ['/' + this.rootSlug];
    if (slug) {
      commands.push(slug);
    }
    return commands;
  }
  navigate(slug?: string, extras?: NavigationExtras ): Promise<boolean>{
    return this.router.navigate(this.routerLink(slug), extras);
  }

  //************ API Methods **************///
  emailSignIn(email: string, password: string, name?: string): Promise<firebase.User> {
    return new Promise((resolve, reject) => {
      const providerId = 'password';
      let accountExists: boolean;
      let user: firebase.User;
      this.getProviderById(providerId)
        .then(() => {
          return this.auth.fetchProvidersForEmail(email);
        })
        .then((providerIds: string[]) => {
          return new Promise((resolve, reject) => {
            if (providerIds.length === 0){
              return resolve(false);
            }
            if (_.includes(providerIds, providerId)) {
              return resolve(true);
            }
            return reject({code: 'sfa/no-password-for-user', message: 'The account wth that email does not have a password'});
          })
        })
        .then((result: boolean) => {
          accountExists = result;
          if (! accountExists){
            return this.auth.createUserWithEmailAndPassword(email, password);
          }
        })
        .then(() => {
          return this.auth.signInWithEmailAndPassword(email, password)
        })
        .then((result: firebase.User) => {
          user = result;
          if ((! accountExists) && this.requireDisplayName) {
            return user.updateProfile({displayName: <string>name, photoURL: null});
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
          this._onSignedIn.next({
            user: user,
            providerId: providerId
          });
          if (! this.authRedirectCancelled) {
            this.router.navigate(['/', this.rootSlug, 'account'])
          }
          resolve(user);
        })
        .catch(reject);
    })
  }











}
