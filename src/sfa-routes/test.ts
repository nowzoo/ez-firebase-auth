import { Directive, Input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'ng2-mock-component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import * as firebase from 'firebase';

import { SfaService } from '../sfa/sfa.service';
import { OauthService } from './oauth.service';


@Directive({
  selector: '[sfaProviderTitle]'
})
class MockProviderTitleDirective  {
  @Input() public sfaProviderTitle: {label: string, id: string};
}

export const MOCK_UTILITIES_DECLARATIONS = [
  MockProviderTitleDirective,
  MockComponent({ selector: 'sfa-provider-icon', inputs: ['providerId'] }),
  MockComponent({ selector: 'sfa-provider-label', inputs: ['providerId'] }),
  MockComponent({ selector: 'sfa-toggleable-password', inputs: ['control'] }),
  MockComponent({ selector: 'sfa-application-label'}),
  MockComponent({ selector: 'sfa-providers-list-phrase', inputs: ['providerIds'] }),
  MockComponent({ selector: 'sfa-icon-wait'}),
  MockComponent({ selector: 'sfa-icon-warning'}),
  MockComponent({ selector: 'sfa-icon-success'}),
  MockComponent({ selector: '[sfaInvalidInput]', inputs: ['sfaInvalidInput'] }),
  MockComponent({ selector: '[sfaInvalidFeedback]', inputs: ['sfaInvalidFeedback', 'key'] }),
];






export const MOCK_IMPORTS = [
   ReactiveFormsModule, RouterTestingModule
];


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
}

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

export const MOCK_AUTH: firebase.auth.Auth = {
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
}

export const MOCK_ROUTE_GET = (qp?) => {
  qp = qp || {}
  return {snapshot: {queryParams: qp}};
};
export const MOCK_AUTH_SERVICE_GET = () => {
  const signedIn$: Subject<any> = new Subject();
  return  {
    auth: MOCK_AUTH,
    getProviderById: () => {},
    onRoute: (e) => {},
    onEmailChanged: () => {},
    navigate: () => {},
    setPersistenceLocal: () => Promise.resolve(),
    onSignedIn: (e) => signedIn$.next(e),
    signedIn: signedIn$.asObservable(),
    oAuthProviderIds: [],
    configuredProviderIds: [],
    persistenceLocal: new BehaviorSubject<any>(true),
    authState: new BehaviorSubject<any>(null)
  }
};
export const MOCK_OAUTH_SERVICE_GET = () => {
  return {
    reauthenticateWithRedirect: () => Promise.resolve(null),
    reauthenticateWithPopup: () => Promise.resolve(null),
    checkForReauthenticateRedirect: () => Promise.resolve(null),
    checkForLinkRedirect: ()  => Promise.resolve(null),
    checkForSignInRedirect: ()  => Promise.resolve(null),
    linkWithPopup: () => Promise.resolve(null),
    linkWithRedirect: () => Promise.resolve(null),
    signInWithPopup: () => Promise.resolve(null),
    signInWithRedirect: () => Promise.resolve(null),
  }
}


export const MOCK_PROVIDERS = [
  {provide: SfaService, useValue: MOCK_AUTH_SERVICE_GET()},
  {provide: ActivatedRoute, useValue: MOCK_ROUTE_GET()},
  {provide: OauthService, useValue: MOCK_OAUTH_SERVICE_GET()},
]


export const MOCK_ERROR: firebase.FirebaseError = {
  code: 'auth/mock-error',
  message: 'This is a mock error',
  name: 'MockError'
}
