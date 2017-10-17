import { Component, OnInit } from '@angular/core';
import * as _ from '../../lodash-funcs';
import * as firebase from 'firebase';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import { OauthService } from '../oauth.service';
import { OAuthMethod } from '../../o-auth-method.enum';
import { IAuthUserEvent } from '../../auth-user-event.interface';

@Component({
  selector: 'sfa-oauth-sign-in',
  templateUrl: './oauth-sign-in.component.html',
  styleUrls: ['./oauth-sign-in.component.scss']
})
export class OauthSignInComponent implements OnInit {

  public diffCredError: any = null;
  public unhandledCredError: any = null;
  public oAuthProviderIds: string[] = [];
  constructor(
    protected authService: SimpleFirebaseAuthService,
    protected oAuthService: OauthService
  ) { }

  public ngOnInit() {
    this.oAuthProviderIds = _.clone(this.authService.oAuthProviderIds);
    this.oAuthService.checkForSignInRedirect()
      .catch((error: any) => {
        this.handleOAuthError(error);
      });
  }

  public oAuthSignIn(providerId: string) {
    this.diffCredError = null;
    this.unhandledCredError = null;
    switch (this.authService.oAuthMethod) {
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
            });
          break;

    }
  }
  protected handleOAuthError(error: firebase.FirebaseError) {
    switch (error.code) {
      case 'auth/account-exists-with-different-credential':
        this.diffCredError = error;
        break;
      default:
        this.unhandledCredError = error;
        break;
    }
  }

}
