import * as firebase from 'firebase';
import { Injectable } from '@angular/core';

export interface IAuthEmailChangedEvent {
  user: firebase.User;
  oldEmail: string;
  newEmail: string;
}

export interface IAuthUserEvent {
  user: firebase.User;
  providerId: string;
  credential?: firebase.auth.UserCredential;
}

export enum OAuthMethod {
  popup = 1,
  redirect
}

export const SUPPORTED_PROVIDERS = ['password' , 'twitter.com' , 'facebook.com' , 'github.com' , 'google.com'];
export const LOCAL_PERSISTENCE_DISABLED_STORAGE_KEY = 'sfa-local-persistence-disabled';

export class SfaProviderLabels {
  public 'password' = 'Email/Password';
  public 'twitter.com' = 'Twitter';
  public 'facebook.com' = 'Facebook';
  public 'github.com' = 'GitHub';
  public 'google.com' = 'Google';
}

@Injectable()
export class SfaOptions {
  public applicationLabel: string;
  public rootSlug: string;
  public configuredProviderIds: string[] = [];
  public customizedProviders?: firebase.auth.AuthProvider[] = [];
  public requireDisplayName = true;
  public requireTos = true;
  public sendEmailVerificationLink = true;
  public oAuthMethod?: OAuthMethod = OAuthMethod.redirect;
  public providerLabels?: SfaProviderLabels;
}
