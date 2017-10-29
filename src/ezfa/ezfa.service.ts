import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRouteSnapshot, Router, NavigationExtras } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase';
import * as _ from 'lodash';

import { EzfaOptions } from './ezfa-options.class';
import { EzfaOauthMethod } from './ezfa-oauth-method.enum';
import { EzfaProviderLabels } from './ezfa-provider-labels.class';
import { EzfaSignedInEvent } from './ezfa-signed-in-event.class';
import { EzfaSignedOutEvent } from './ezfa-signed-out-event.class';
import { EzfaEmailChangedEvent } from './ezfa-email-changed-event.class';
import { EzfaProviderLinkedEvent } from './ezfa-provider-linked-event.class';
import { EzfaProviderUnlinkedEvent } from './ezfa-provider-unlinked-event.class';

@Injectable()
export class EzfaService {


  static STORAGE_KEY_PERSISTENCE = 'ezfa-local-persistence-disabled';
  static ENABLED_PROVIDERS = ['password', 'twitter.com', 'facebook.com', 'google.com', 'github.com'];
  static ENABLED_OAUTH_PROVIDERS = ['twitter.com', 'facebook.com', 'google.com', 'github.com'];
  static OUT_OF_BAND_MODES = {
    resetPassword: 'resetPassword',
    verifyEmail: 'verifyEmail',
    recoverEmail: 'recoverEmail'
  };

  protected oauthMethod$: BehaviorSubject<EzfaOauthMethod>;
  protected localPersistenceEnabled$: BehaviorSubject<boolean>;
  protected routeChanges$: Subject<string>;
  protected signedInEvents$: Subject<EzfaSignedInEvent>;
  protected signedOutEvents$: Subject<EzfaSignedOutEvent>;
  protected providerLinkedEvents$: Subject<EzfaProviderLinkedEvent>;
  protected providerUnlinkedEvents$: Subject<EzfaProviderUnlinkedEvent>;
  protected emailChangedEvents$: Subject<EzfaEmailChangedEvent>;
  protected savedPopupPromise_: Promise<firebase.auth.UserCredential> | null = null;
  constructor(
    protected router: Router,
    protected afAuth: AngularFireAuth,
    protected options: EzfaOptions
  ) {
    const initialMethod = options.oauthMethod === EzfaOauthMethod.popup ? EzfaOauthMethod.popup : EzfaOauthMethod.redirect;
    this.oauthMethod$ = new BehaviorSubject(initialMethod);
    const localPersEnabled = localStorage.getItem(EzfaService.STORAGE_KEY_PERSISTENCE) === 'yes' ? false : true;
    this.localPersistenceEnabled$ =  new BehaviorSubject(localPersEnabled);

    this.routeChanges$ = new Subject();
    this.signedInEvents$ = new Subject();
    this.signedOutEvents$ = new Subject();
    this.emailChangedEvents$ = new Subject();
    this.providerLinkedEvents$ = new Subject();
    this.providerUnlinkedEvents$ = new Subject();
  }

  get auth(): firebase.auth.Auth {
    return this.afAuth.auth;
  }

  get authState(): Observable<firebase.User> {
    return this.afAuth.authState;
  }

  get applicationLabel(): string {
    return this.options.applicationLabel;
  }


  get rootSlug(): string {
    return this.options.rootSlug;
  }

  get providerIds(): string[] {
    return _.filter(this.options.providerIds, id => {
      return _.includes(EzfaService.ENABLED_PROVIDERS, id);
    });
  }

  set providerIds(ids: string[]) {
    this.options.providerIds = ids;
  }

  get oauthProviderIds(): string[] {
    return _.filter(this.providerIds, id => {
      return _.includes(EzfaService.ENABLED_OAUTH_PROVIDERS, id);
    });
  }

  get passwordProviderEnabled(): boolean {
    return _.includes(this.providerIds, 'password');
  }


  get providerLabels(): EzfaProviderLabels {
    const passed = this.options.providerLabels || {};
    const def = new EzfaProviderLabels();
    return _.assign({}, def, passed);
  }

  get requireDisplayName(): boolean {
    return this.options.requireDisplayName !== false;
  }

  set requireDisplayName(b: boolean) {
    this.options.requireDisplayName = b;
  }

  get requireTos(): boolean {
    return this.options.requireTos !== false;
  }

  set requireTos(b: boolean) {
    this.options.requireTos = b;
  }

  get sendEmailVerificationLink(): boolean {
    return this.options.sendEmailVerificationLink !== false;
  }

  set sendEmailVerificationLink(b: boolean) {
    this.options.sendEmailVerificationLink = b;
  }

  get oauthMethod(): EzfaOauthMethod {
    return this.oauthMethod$.value;
  }
  set oauthMethod(method: EzfaOauthMethod) {
    this.oauthMethod$.next(method);
  }


  public getProviderById(id: string): Promise<firebase.auth.AuthProvider> {
    return new Promise((resolve, reject) => {
      if (! _.includes(this.providerIds, id)) {
        return reject({code: 'ezfa/provider-not-configured'});
      }
      const customProvider = _.find(this.options.providers, {providerId: id});
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



  routerLink(slug?: string|null): string[] {
    const commands = ['/' + this.rootSlug];
    if (slug) {
      commands.push(slug);
    }
    return commands;
  }
  navigate(slug?: string|null, extras?: NavigationExtras ): Promise<boolean> {
    return this.router.navigate(this.routerLink(slug), extras);
  }


  get localPersistenceEnabled(): Observable<boolean> {
    return this.localPersistenceEnabled$.asObservable();
  }
  public setPersistenceLocal(b: boolean): Promise<void> {
    return new Promise<void>((resolve) => {
      const persistence: firebase.auth.Auth.Persistence = b ?
        firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
      this.auth.setPersistence(persistence)
        .then(() => {
          if (b) {
            localStorage.removeItem(EzfaService.STORAGE_KEY_PERSISTENCE);
          } else {
            localStorage.setItem(EzfaService.STORAGE_KEY_PERSISTENCE, 'yes');
          }
          this.localPersistenceEnabled$.next(b);
          resolve();
        });
    });
  }

  get routeChanges(): Observable<string> {
    return this.routeChanges$.asObservable();
  }

  onRouteChange(route: string) {
    this.routeChanges$.next(route);
  }
  get signedInEvents(): Observable<EzfaSignedInEvent> {
    return this.signedInEvents$.asObservable();
  }

  onSignedIn(event: EzfaSignedInEvent) {
    this.signedInEvents$.next(event);
  }

  get signedOutEvents(): Observable<EzfaSignedOutEvent> {
    return this.signedOutEvents$.asObservable();
  }

  onSignedOut(event: EzfaSignedOutEvent) {
    this.signedOutEvents$.next(event);
  }

  get emailChangedEvents(): Observable<EzfaEmailChangedEvent> {
    return this.emailChangedEvents$.asObservable();
  }

  onEmailChanged(event: EzfaEmailChangedEvent) {
    this.emailChangedEvents$.next(event);
  }

  get providerLinkedEvents(): Observable<EzfaProviderLinkedEvent> {
    return this.providerLinkedEvents$.asObservable();
  }

  onProviderLinked(event: EzfaProviderLinkedEvent) {
    this.providerLinkedEvents$.next(event);
  }

  get providerUnlinkedEvents(): Observable<EzfaProviderUnlinkedEvent> {
    return this.providerUnlinkedEvents$.asObservable();
  }

  onProviderUnlinked(event: EzfaProviderUnlinkedEvent) {
    this.providerUnlinkedEvents$.next(event);
  }

  get savedPopupPromise(): Promise<firebase.auth.UserCredential> | null {
    return this.savedPopupPromise_;
  }
  set savedPopupPromise(promise: Promise<firebase.auth.UserCredential> | null) {
    this.savedPopupPromise_ = promise;
  }


}
