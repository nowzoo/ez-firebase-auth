import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';

import { EzfaService } from '../../ezfa.service';
import { EzfaProviderLinkedEvent } from '../../ezfa-provider-linked-event.class';
import { EzfaOauthMethod } from '../../ezfa-oauth-method.enum';
import { BaseComponent } from '../base.component';
import { Messages } from '../messages.enum';

@Component({
  selector: 'ezfa-link-route',
  templateUrl: './link-route.component.html',
  styleUrls: ['./link-route.component.scss']
})
export class LinkRouteComponent extends BaseComponent implements OnInit {
  user: firebase.User | null;
  providerId: string;
  error: firebase.FirebaseError | null = null;
  success: EzfaProviderLinkedEvent | null = null;
  wait = true;



  constructor(
    public route: ActivatedRoute,
    service: EzfaService,
  ) {
    super(service);
  }

  ngOnInit() {
    this.service.onRouteChange('link');
    this.providerId = this.route.snapshot.queryParams.providerId;
    if (! this.providerId) {
      this.service.navigate();
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
    this.service.getProviderById(this.providerId)
    .then((provider) => {
      switch (this.service.oauthMethod) {
        case EzfaOauthMethod.popup:
          return this.user.linkWithPopup(provider);
        default:
          return this.user.linkWithRedirect(provider);
      }
    })
    .then((result?: firebase.auth.UserCredential) => {
      if (result) {
        this.onSuccess(result);
      }
    })
    .catch((error: firebase.FirebaseError) => {
      this.onError(error);
    });
  }

  onInitHandleSavedPopupPromise(): Promise<boolean> {
    return new Promise<boolean> ((resolve) => {
      const p = this.service.savedPopupPromise;
      this.service.savedPopupPromise = null;
      if (! this.user) {
        this.service.navigate();
        return resolve(true);
      }
      if (! p) {
        return resolve(false);
      }
      p.then((result: firebase.auth.UserCredential) => {
        this.onSuccess(result);
        resolve(true);
      })
      .catch((error: firebase.FirebaseError) => {
        this.onError(error);
        resolve(true);
      });
    });
  }

  onInitCheckForRedirect(): Promise<boolean> {
    return new Promise<boolean> ((resolve) => {
      if (! this.user) {
        this.service.navigate();
        return resolve(true);
      }
      this.service.auth.getRedirectResult()
        .then((result: firebase.auth.UserCredential) => {
          if (result.user) {
            this.onSuccess(result);
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((error: firebase.FirebaseError) => {
          this.onError(error);
          resolve(true);
        });
    });
  }

  onSuccess(cred: firebase.auth.UserCredential) {
    this.error = null;
    const event = new EzfaProviderLinkedEvent(cred.user, cred.credential.providerId, cred);
    this.success = event;
    this.wait = false;
    const params = {message: null};
    switch (cred.credential.providerId) {
      case 'twitter.com': params.message = Messages.twitterAccountAdded; break;
      case 'facebook.com': params.message = Messages.facebookAccountAdded; break;
      case 'github.com': params.message = Messages.githubAccountAdded; break;
      case 'google.com': params.message = Messages.googleAccountAdded; break;
    }
    this.service.onProviderLinked(event);
    this.service.navigate('account', {queryParams: params});
  }

  onError(error: firebase.FirebaseError) {
    this.wait = false;
    this.error = error;
    this.success = null;
  }
}
