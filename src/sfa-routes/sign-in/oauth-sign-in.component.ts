import { Component, OnInit } from '@angular/core';
import * as _ from '../../utils/lodash-funcs';
import * as firebase from 'firebase';
import { SfaService } from '../../sfa/sfa.service';
import { OauthService } from '../oauth.service';
import { OAuthMethod } from '../../sfa/sfa';
import { IAuthUserEvent } from '../../sfa/sfa';

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
    protected authService: SfaService,
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
