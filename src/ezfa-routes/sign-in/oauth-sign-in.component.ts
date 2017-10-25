import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import { EzfaService } from '../../ezfa/ezfa.service';
import { OauthService } from '../oauth.service';
import { OAuthMethod } from '../../sfa/sfa';
import { IAuthUserEvent } from '../../sfa/sfa';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'ezfa-oauth-sign-in',
  templateUrl: './oauth-sign-in.component.html',
  styleUrls: ['./oauth-sign-in.component.scss']
})
export class OauthSignInComponent extends BaseComponent implements OnInit {

  public diffCredError: any = null;
  public unhandledCredError: any = null;
  public oAuthProviderIds: string[] = [];
  constructor(
    protected oAuthService: OauthService,
    authService: EzfaService
  ) {
  super(authService)
}

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
