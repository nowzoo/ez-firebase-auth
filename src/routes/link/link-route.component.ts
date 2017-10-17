import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';
import * as firebase from 'firebase';

import * as _ from '../../lodash-funcs';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import { OauthService } from '../oauth.service';
import { IAuthUserEvent } from '../../auth-user-event.interface';
import { OAuthMethod } from '../../o-auth-method.enum';

@Component({
  selector: 'sfa-link-route',
  templateUrl: './link-route.component.html',
  styleUrls: ['./link-route.component.scss']
})
export class LinkRouteComponent implements OnInit, OnDestroy {

  public user: firebase.User | null = null;
  public providerId: string;
  public error: firebase.FirebaseError | null = null;
  public success: IAuthUserEvent | null = null;
  public wait: boolean = true;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected route: ActivatedRoute,
    protected authService: SimpleFirebaseAuthService,
    protected oAuthService: OauthService,
  ) { }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public ngOnInit() {
    this.providerId = this.route.snapshot.queryParams.providerId;
    if (! this.providerId) {
      this.authService.navigate('account');
      return;
    }
    this.authService.authState.take(1).subscribe((user: firebase.User | null) => {
      let savedPromiseHandled: boolean = false;
      if (! user) {
        return this.authService.navigate('sign-in');
      }

      this.user = user;
      this.user.reload()
        .then(() => {
          return this.onInitHandleSavedPopupPromise();
        })
        .then((handled: boolean) => {
          savedPromiseHandled = handled;
          if (handled) {
            return null;
          }
          return this.oAuthService.checkForLinkRedirect();
        })
        .then((e: IAuthUserEvent | null) => {

          if (e) {
            this.onLinkSuccess(e);
            return;
          }
          if (! savedPromiseHandled) {
            this.link();
          }
        })
        .catch((error: firebase.FirebaseError) => {
          this.onLinkError(error);
        });

    });

  }

  public link() {
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
      if (! this.oAuthService.savedPopupPromise) {
        return resolve(false);
      }
      const p = this.oAuthService.savedPopupPromise;
      this.oAuthService.savedPopupPromise = null;
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

  protected onLinkSuccess(event: IAuthUserEvent) {
    this.error = null;
    this.success = event;
    this.wait = false;
  }
  protected onLinkError(error: firebase.FirebaseError) {
    this.wait = false;
    this.error = error;
    this.success = null;
  }

}
