import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import { EzfaService } from '../../ezfa.service';
import { EzfaOauthMethod } from '../../ezfa-oauth-method.enum';
import { EzfaSignedInEvent } from '../../ezfa-signed-in-event.class';
import { BaseComponent } from '../base.component';
import { Messages } from '../messages.enum';

@Component({
  selector: 'ezfa-oauth-sign-in',
  templateUrl: './oauth-sign-in.component.html',
  styleUrls: ['./oauth-sign-in.component.scss']
})
export class OauthSignInComponent extends BaseComponent implements OnInit {

  error: firebase.FirebaseError | null = null;
  providerIds: string[] = [];
  userProviderIds: string[] = [];
  constructor(
    service: EzfaService
  ) {
    super(service);
  }

  ngOnInit() {
    this.providerIds = _.filter(this.service.providerIds, id => {
      return 'password' !== id;
    });
    this.checkForRedirect();
  }

  checkForRedirect(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.service.auth.getRedirectResult()
        .then((result: firebase.auth.UserCredential) => {
          if (result.user) {
            this.onSuccess(result);
            resolve(true);
          }
          resolve(false);
        })
        .catch((error: firebase.FirebaseError) => {
          this.onError(error);
          resolve(true);
        });
    });
  }

  signIn(providerId: string) {
    this.error = null;
    this.userProviderIds = [];
    this.service.getProviderById(providerId)
      .then((provider: firebase.auth.AuthProvider) => {
        switch (this.service.oauthMethod) {
          case EzfaOauthMethod.popup:
            return this.service.auth.signInWithPopup(provider);
          default:
            return this.service.auth.signInWithRedirect(provider);
        }
      })
      .then((result?: firebase.auth.UserCredential) => {
        if (result) {
          this.onSuccess(result);
        }
      })
      .catch(err => {
        this.onError(err);
      });
  }

  onError(error: any) {
    this.error = error;
    this.userProviderIds = [];
    switch (error.code) {
      case 'auth/account-exists-with-different-credential':
        this.service.auth.fetchProvidersForEmail(error.email as string)
          .then(providerIds => this.userProviderIds = providerIds);
        break;
    }
  }

  onSuccess(cred: firebase.auth.UserCredential) {
    const event = new EzfaSignedInEvent(cred.user, cred.credential.providerId, cred);
    this.service.onSignedIn(event);
    if (! event.redirectCancelled) {
      this.service.navigate('account', {queryParams: {message: Messages.signedIn}});
    }
  }

}
