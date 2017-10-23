import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';

import { SfaService } from '../../sfa/sfa.service';
import { OauthService } from '../oauth.service';
import { IAuthUserEvent } from '../../sfa/sfa';
import { OAuthMethod } from '../../sfa/sfa';
import { SfaBaseComponent } from '../sfa-base.component';
import { SfaMessages } from '../messages.enum';

@Component({
  selector: 'sfa-link-route',
  templateUrl: './link-route.component.html',
  styleUrls: ['./link-route.component.scss']
})
export class LinkRouteComponent extends SfaBaseComponent implements OnInit {
  user: firebase.User | null;
  providerId: string;
  error: firebase.FirebaseError | null = null;
  success: IAuthUserEvent | null = null;
  wait = true;



  constructor(
    protected route: ActivatedRoute,
    protected oAuthService: OauthService,
    authService: SfaService,
  ) {
    super(authService);
  }



  ngOnInit() {
    this.authService.onRoute('link');
    this.providerId = this.route.snapshot.queryParams.providerId;
    if (! this.providerId) {
      this.authService.navigate();
      return;
    }
    this.onInitLoadUser()
      .then(() => {
        return this.onInitHandleSavedPopupPromise();
      })
      .then((handled: boolean) => {
        if (handled) {
          return true;
        } else {
          return this.onInitCheckForRedirect();
        }
      })
      .then((handled: boolean) => {
        if (! handled) {
          this.link();
        }
        this.gateToSignedInUser();
      });
  }


  link() {
    this.error = null;
    this.success = null;
    this.wait = true;
    const user = this.user as firebase.User;
    switch (this.authService.oAuthMethod) {
      case OAuthMethod.popup:
        this.oAuthService.linkWithPopup(this.providerId, user)
          .then((event: IAuthUserEvent) => {
            this.onLinkSuccess(event);
            return;
          })
          .catch((error: firebase.FirebaseError) => {
            this.onLinkError(error);
          });
        break;
      default:
        this.oAuthService.linkWithRedirect(this.providerId, user)
          .catch((error: firebase.FirebaseError) => {
            this.onLinkError(error);
          });
        break;
    }
  }

  protected onInitHandleSavedPopupPromise(): Promise<boolean> {
    return new Promise<boolean> ((resolve) => {
      const p = this.oAuthService.savedPopupPromise;
      this.oAuthService.savedPopupPromise = null;
      if (! this.user) {
        this.authService.navigate();
        return resolve(true);
      }
      if (! p) {
        return resolve(false);
      }
      p.then((event: IAuthUserEvent | null) => {
        if (! event) {
          resolve(false);
        } else {
          this.onLinkSuccess(event);
          resolve(true);
        }

      })
      .catch((error: firebase.FirebaseError) => {
        this.onLinkError(error);
        resolve(true);
      });
    });
  }
  protected onInitCheckForRedirect(): Promise<boolean> {
    return new Promise<boolean> ((resolve) => {
      if (! this.user) {
        this.authService.navigate();
        return resolve(true);
      }
      this.oAuthService.checkForLinkRedirect()
        .then((e: IAuthUserEvent | null) => {
          if (e) {
            this.onLinkSuccess(e);
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((error: firebase.FirebaseError) => {
          this.onLinkError(error);
          resolve(true);
        });
    });
  }

  protected onLinkSuccess(event: IAuthUserEvent) {
    this.error = null;
    this.success = event;
    this.wait = false;
    const params = {message: null};
    switch (event.providerId) {
      case 'twitter.com': params.message = SfaMessages.twitterAccountAdded; break;
      case 'facebook.com': params.message = SfaMessages.facebookAccountAdded; break;
      case 'github.com': params.message = SfaMessages.githubAccountAdded; break;
      case 'google.com': params.message = SfaMessages.googleAccountAdded; break;
    }
    this.authService.navigate('account', {queryParams: params})
  }
  protected onLinkError(error: firebase.FirebaseError) {
    this.wait = false;
    this.error = error;
    this.success = null;
  }
}
