import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import { OauthService } from '../oauth.service';
import { OAuthMethod, AuthUserEvent } from '../../simple-firebase-auth';

@Component({
  selector: 'sfa-oauth-sign-in',
  templateUrl: './oauth-sign-in.component.html',
  styleUrls: ['./oauth-sign-in.component.scss']
})
export class OauthSignInComponent implements OnInit {

  diffCredError: any = null;
  unhandledCredError: any = null;
  oAuthProviderIds: string[];
  constructor(
    protected authService: SimpleFirebaseAuthService,
    protected oAuthService: OauthService
  ) { }

  ngOnInit() {
    this.oAuthProviderIds = _.clone(this.authService.oAuthProviderIds);
    this.oAuthService.checkForSignInRedirect()
      .catch((error: any) => {
        this.handleOAuthError(error);
      })
  }

  oAuthSignIn(providerId) {
    this.diffCredError = null;
    this.unhandledCredError = null;
    switch(this.authService.oAuthMethod) {
      case OAuthMethod.popup:
        this.oAuthService.signInWithPopup(providerId)
          .catch((error: any) => {
            this.handleOAuthError(error);
          });
          break;
        default:
          this.oAuthService.signInWithRedirect(providerId)
            .catch((error: firebase.FirebaseError) => {
              this.handleOAuthError(error);
            })
            break;

    }
  }
  handleOAuthError(error: firebase.FirebaseError) {
    switch(error.code) {
      case 'auth/account-exists-with-different-credential':
        this.diffCredError = error;
        break;
      default:
        this.unhandledCredError = error;
        break;
    }
  }

}
