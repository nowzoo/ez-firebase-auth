import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';
import * as _ from 'lodash';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import { OauthService } from '../oauth.service';
import { OAuthMethod, AuthUserEvent } from '../../simple-firebase-auth';

@Component({
  selector: 'sfa-link-route',
  templateUrl: './link-route.component.html',
  styleUrls: ['./link-route.component.scss']
})
export class LinkRouteComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  user: firebase.User = null;
  providerId: string;
  error: firebase.FirebaseError = null;
  success: AuthUserEvent = null;
  wait: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private authService: SimpleFirebaseAuthService,
    private oAuthService: OauthService,
  ) { }

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    this.providerId = this.route.snapshot.queryParams.providerId;
    if (! this.providerId) {
      this.authService.navigate('account');
      return;
    }
    this.authService.authState.take(1).subscribe((user: firebase.User | null) => {
      let savedPromiseHandled: boolean = false;
      if (! user){
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
        .then((e: AuthUserEvent| null) => {

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
        })

    })

  }

  onInitHandleSavedPopupPromise(): Promise<boolean> {
    return new Promise<boolean> ((resolve) => {
      if (! this.oAuthService.savedPopupPromise) {
        return resolve(false);
      }
      const p = this.oAuthService.savedPopupPromise;
      this.oAuthService.savedPopupPromise = null;
      p.then((event: AuthUserEvent|null) => {
        if (! event){
          resolve(false);
        } else {
          this.onLinkSuccess(event);
          resolve(true);
        }

      })
      .catch((error: firebase.FirebaseError) => {
        this.onLinkError(error);
        resolve(true);
      })
    });
  }

  onLinkSuccess(event: AuthUserEvent) {
    this.error = null;
    this.success = event;
    this.wait = false;
  }
  onLinkError(error: firebase.FirebaseError) {
    this.wait = false;
    this.error = error;
    this.success = null;
  }

  link() {
    this.error = null;
    this.success = null;
    this.wait = true;
    switch(this.authService.oAuthMethod) {
      case OAuthMethod.popup:
        this.oAuthService.linkWithPopup(this.providerId, this.user)
          .then((event: AuthUserEvent| null) => {
            this.onLinkSuccess(event);
            return;
          })
          .catch((error: firebase.FirebaseError) => {
            this.onLinkError(error);
          })
        break;
      default:
        this.oAuthService.linkWithRedirect(this.providerId, this.user)
          .catch((error: firebase.FirebaseError) => {
            this.onLinkError(error);
          });
        break;
    }
  }
}
