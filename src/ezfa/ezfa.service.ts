import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRouteSnapshot, Router, NavigationExtras } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import {
  SUPPORTED_PROVIDERS,
  LOCAL_PERSISTENCE_DISABLED_STORAGE_KEY,
  EzfaOptions,  EzfaProviderLabels,
  IAuthEmailChangedEvent, IAuthUserEvent,
  OAuthMethod
} from './ezfa';

@Injectable()
export class EzfaService {

  private settableOAuthMethod: OAuthMethod|null = null;
  private persistenceLocal$: BehaviorSubject<boolean>;
  private pAuthRedirectCancelled = false;
  private signedIn$: Subject<IAuthUserEvent>;
  private signedOut$: Subject<void>;
  private providerLinked$: Subject<IAuthUserEvent>;
  private providerUnlinked$: Subject<IAuthUserEvent>;
  private emailChanged$: Subject<IAuthEmailChangedEvent>;
  private route$: Subject<string>;

  constructor(
    protected options: EzfaOptions,
    protected router: Router,
    protected afAuth: AngularFireAuth
  ) {
    this.persistenceLocal$ =  new BehaviorSubject(
      localStorage.getItem(LOCAL_PERSISTENCE_DISABLED_STORAGE_KEY) === 'yes' ? false : true
    );
    this.signedIn$ = new Subject();
    this.signedOut$ = new Subject<void>();
    this.providerLinked$  = new Subject();
    this.providerUnlinked$  = new Subject();
    this.emailChanged$  = new Subject();
    this.route$  = new Subject();
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
    return _.filter(this.options.configuredProviderIds, (id: string) => {
      return _.includes(SUPPORTED_PROVIDERS, id);
    });
  }

  get oAuthProviderIds(): string[] {
    return _.filter(this.configuredProviderIds, (id: string) => {
      return id !== 'password' && id !== 'phone';
    });
  }

  public getProviderById(id: string): Promise<firebase.auth.AuthProvider> {
    return new Promise((resolve, reject) => {
      if (! _.includes(this.configuredProviderIds, id)) {
        return reject({code: 'ezfa/provider-not-configured'});
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

  get providerLabels(): EzfaProviderLabels {
    const defaultLabels = new EzfaProviderLabels();
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

  get signedIn(): Observable<IAuthUserEvent> {
    return this.signedIn$.asObservable();
  }
  public onSignedIn(event: IAuthUserEvent) {
    this.authRedirectCancelled = false;
    this.signedIn$.next(event);
    if (! this.authRedirectCancelled) {
      this.navigate('account');
    }
  }
  get signedOut(): Observable<void> {
    return this.signedOut$.asObservable();
  }
  public onSignedOut() {
    this.authRedirectCancelled = false;
    this.signedOut$.next();
    if (! this.authRedirectCancelled) {
      this.navigate('sign-in');
    }
  }

  get providerLinked(): Observable<IAuthUserEvent> {
    return this.providerLinked$.asObservable();
  }
  public onProviderLinked(event: IAuthUserEvent) {
    this.providerLinked$.next(event);
  }
  get providerUnlinked(): Observable<IAuthUserEvent> {
    return this.providerUnlinked$.asObservable();
  }
  public onProviderUnlinked(event: IAuthUserEvent) {
    this.providerUnlinked$.next(event);
  }

  get emailChanged(): Observable<IAuthEmailChangedEvent> {
    return this.emailChanged$.asObservable();
  }
  public onEmailChanged(event: IAuthEmailChangedEvent) {
    this.emailChanged$.next(event);
  }
  get route(): Observable<string> {
    return this.route$.asObservable();
  }
  public onRoute(slug: string) {
    this.route$.next(slug);
  }

  public routerLink(slug?: string|null): string[] {
    const commands = ['/' + this.rootSlug];
    if (slug) {
      commands.push(slug);
    }
    return commands;
  }
  public navigate(slug?: string|null, extras?: NavigationExtras ): Promise<boolean> {
    return this.router.navigate(this.routerLink(slug), extras);
  }

}
