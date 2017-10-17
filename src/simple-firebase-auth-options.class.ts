import * as firebase from 'firebase';
import { OAuthMethod } from './o-auth-method.enum';
import { SimpleFirebaseAuthProviderLabels } from './simple-firebase-auth-provider-labels.class';
export class SimpleFirebaseAuthOptions {
  public applicationLabel: string;
  public rootSlug: string;
  public configuredProviderIds: string[] = [];
  public customizedProviders?: firebase.auth.AuthProvider[] = [];
  public requireDisplayName?: boolean = true;
  public requireTos?: boolean = true;
  public sendEmailVerificationLink?: boolean = true;
  public oAuthMethod?: OAuthMethod = OAuthMethod.redirect;
  public providerLabels?: SimpleFirebaseAuthProviderLabels;

}
