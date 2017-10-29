import { Directive, Input } from '@angular/core';
import { MockComponent } from 'ng2-mock-component';
import { AngularFireAuth } from 'angularfire2/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { EzfaOptions } from './ezfa-options.class';
import { EzfaProviderLabels } from './ezfa-provider-labels.class';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


export const MOCK_IMPORTS = [
   ReactiveFormsModule, RouterTestingModule
];

export const MOCK_ERROR = {
  code: 'auth/error',
  message: 'this is a mock error',
  name: 'MOCK_ERROR'
};


export const MOCK_USER: firebase.User = {
  email: 'foo@bar.com',
  isAnonymous: false,
  providerData: [],
  emailVerified: false,
  phoneNumber: null,
  refreshToken: null,
  displayName: 'Foo Bar',
  photoURL: null,
  providerId: null,
  uid: 'foo-bar',
  metadata: {},
  getIdToken: (b: boolean) => Promise.resolve(),
  getToken: (b: boolean) => Promise.resolve(),
  linkWithCredential: () => Promise.resolve(),
  reload: () => Promise.resolve(),
  delete: () => Promise.resolve(),
  linkAndRetrieveDataWithCredential: () => Promise.resolve(),
  linkWithPopup: () => Promise.resolve(),
  linkWithPhoneNumber: () => Promise.resolve(),
  linkWithRedirect: () => Promise.resolve(),
  reauthenticateAndRetrieveDataWithCredential: () => Promise.resolve(),
  reauthenticateWithCredential: () => Promise.resolve(),
  reauthenticateWithPhoneNumber: () => Promise.resolve(),
  reauthenticateWithPopup: () => Promise.resolve(),
  reauthenticateWithRedirect: () => Promise.resolve(),
  sendEmailVerification: () => Promise.resolve(),
  toJSON: () => '{}',
  unlink: (providerId: string) => Promise.resolve(),
  updateEmail: (email: string) => Promise.resolve(),
  updatePassword: (password: string) => Promise.resolve(),
  updateProfile: (profile: {displayName: string, photoURL: string}) => Promise.resolve(),
  updatePhoneNumber: (phoneCredential: firebase.auth.AuthCredential) => Promise.resolve(),
};

export const MOCK_USER_INFO: firebase.UserInfo = {
  displayName: 'Foo Bar',
  email: 'foo@bar.com',
  phoneNumber: null,
  photoURL: null,
  providerId: null,
  uid: 'foo-bar'
};
export const MOCK_USER_INFO_PASSWORD: firebase.UserInfo = Object.assign({}, MOCK_USER_INFO, {providerId: 'password'});
export const MOCK_USER_INFO_TWITTER: firebase.UserInfo = Object.assign({}, MOCK_USER_INFO, {providerId: 'twitter.com'});
export const MOCK_USER_INFO_FACEBOOK: firebase.UserInfo = Object.assign({}, MOCK_USER_INFO, {providerId: 'facebook.com'});
export const MOCK_USER_INFO_GOOGLE: firebase.UserInfo = Object.assign({}, MOCK_USER_INFO, {providerId: 'google.com'});
export const MOCK_USER_INFO_GITHUB: firebase.UserInfo = Object.assign({}, MOCK_USER_INFO, {providerId: 'github.com'});

export const getMockAuth = (authState?: BehaviorSubject<any>): firebase.auth.Auth => {
  return {
    app: {} as firebase.app.App,
    currentUser: null,
    languageCode: 'en',
    applyActionCode: (oobCode: string) => Promise.resolve(),
    checkActionCode: (oobCode: string) => Promise.resolve(),
    confirmPasswordReset: (oobCode: string, password: string) => Promise.resolve(),
    createUserWithEmailAndPassword: (email: string, password: string) => Promise.resolve(),
    fetchProvidersForEmail: (email: string) => Promise.resolve([]),
    getRedirectResult: () => Promise.resolve(),
    onAuthStateChanged: (nextOrObserver, error, completed) =>  () => {},
    onIdTokenChanged: (nextOrObserver, error, completed) =>  () => {},
    sendPasswordResetEmail: (email: string) => Promise.resolve(),
    setPersistence: (p) => Promise.resolve(),
    signInAndRetrieveDataWithCredential: (c) => Promise.resolve(),
    signInAnonymously: () => Promise.resolve(),
    signInWithCredential: (c) => Promise.resolve(),
    signInWithCustomToken: (t) => Promise.resolve(),
    signInWithEmailAndPassword: (e, p) => Promise.resolve(),
    signInWithPhoneNumber: (e, p) => Promise.resolve(),
    signInWithPopup: (p) => Promise.resolve(),
    signInWithRedirect: (p) => Promise.resolve(),
    signOut: () => Promise.resolve(),
    useDeviceLanguage: () => {},
    verifyPasswordResetCode: (oobCode: string) => Promise.resolve(),
  };

};

export const getMockService = (authState?: BehaviorSubject<any>, localPersistenceEnabled$?: BehaviorSubject<any>) => {
  const signedInEvents$: Subject<any> = new Subject();
  const providerLinkedEvents$: Subject<any> = new Subject();
  const signedOutEvents$: Subject<any> = new Subject();
  return  {
    auth: getMockAuth(),
    getProviderById: (id) => Promise.resolve({providerId: id}),
    onRouteChange: (e) => {},
    onEmailChanged: () => {},
    navigate: () => {},
    setPersistenceLocal: () => Promise.resolve(),
    onSignedIn: (e) => signedInEvents$.next(e),
    onProviderLinked: (e) => providerLinkedEvents$.next(e),
    onProviderUnlinked: (e) => {},
    onSignedOut: (e) => signedOutEvents$.next(e),
    localPersistenceEnabled:  localPersistenceEnabled$ ? localPersistenceEnabled$.asObservable() : new BehaviorSubject(true),
    signedInEvents: signedInEvents$.asObservable(),
    signedOutEvents: signedOutEvents$.asObservable(),
    oAuthProviderIds: [],
    configuredProviderIds: [],
    persistenceLocal: new BehaviorSubject<any>(true),
    authState: authState ? authState : new BehaviorSubject<any>(null)
  };
};

@Directive({
  selector: '[ezfaProviderTitle]'
})
class MockProviderTitleDirective  {
  @Input() public ezfaProviderTitle: {label: string, id: string};
}

export const MOCK_UTILITIES_DECLARATIONS = [
  MockProviderTitleDirective,
  MockComponent({ selector: 'ezfa-provider-icon', inputs: ['providerId'] }),
  MockComponent({ selector: 'ezfa-provider-label', inputs: ['providerId'] }),
  MockComponent({ selector: 'ezfa-toggleable-password', inputs: ['control'] }),
  MockComponent({ selector: 'ezfa-application-label'}),
  MockComponent({ selector: 'ezfa-providers-list-phrase', inputs: ['providerIds'] }),
  MockComponent({ selector: 'ezfa-icon-wait'}),
  MockComponent({ selector: 'ezfa-icon-warning'}),
  MockComponent({ selector: 'ezfa-icon-success'}),
  MockComponent({ selector: '[ezfaInvalidInput]', inputs: ['ezfaInvalidInput'] }),
  MockComponent({ selector: '[ezfaInvalidFeedback]', inputs: ['ezfaInvalidFeedback', 'key'] }),
];

export const MOCK_USER_CRED: firebase.auth.UserCredential = {
  credential: {providerId: 'twitter.com'},
  user: MOCK_USER
};

export const getMockActivatedRoute = (qp?) => {
  qp = qp || {};
  return {snapshot: {queryParams: qp}};
};
