import * as firebase from 'firebase';
import { Injectable } from '@angular/core';
import { EzfaOauthMethod } from './ezfa-oauth-method.enum';
import { EzfaProviderLabels } from './ezfa-provider-labels.class';
@Injectable()
export class EzfaOptions {
  public applicationLabel: string;
  public rootSlug: string;
  public providerIds: string[] = [];
  public providers?: firebase.auth.AuthProvider[] = [];
  public requireDisplayName? = true;
  public requireTos? = true;
  public sendEmailVerificationLink? = true;
  public oauthMethod?: EzfaOauthMethod = EzfaOauthMethod.redirect;
  public providerLabels?: EzfaProviderLabels;
}
