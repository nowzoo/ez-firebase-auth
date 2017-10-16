import * as firebase from 'firebase';
import { OAuthMethod } from './o-auth-method.enum';
import { SimpleFirebaseAuthProviderLabels } from './simple-firebase-auth-provider-labels.class'
export class SimpleFirebaseAuthOptions {
  applicationLabel: string;
  rootSlug: string;
  configuredProviderIds: string[] = [];
  customizedProviders?: firebase.auth.AuthProvider[] = [];
  requireDisplayName?: boolean = true;
  requireTos?: boolean = true;
  sendEmailVerificationLink?: boolean = true;
  oAuthMethod?: OAuthMethod = OAuthMethod.redirect;
  providerLabels?: SimpleFirebaseAuthProviderLabels;

}
