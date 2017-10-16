import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import * as _ from 'lodash';
import * as firebase from 'firebase';
import { ReauthenticateModes } from '../simple-firebase-auth-routes';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import { OauthService } from '../oauth.service';
import { AuthUserEvent, OAuthMethod } from '../../simple-firebase-auth';
import * as Utils from '../utils';

@Component({
  selector: 'sfa-reauthenticate-route',
  templateUrl: './reauthenticate-route.component.html',
  styleUrls: ['./reauthenticate-route.component.scss']
})
export class ReauthenticateRouteComponent implements OnInit, OnDestroy {
  protected ngUnsubscribe: Subject<void> = new Subject<void>();


  redirect: string = null;
  id: string;
  user: firebase.User;
  fg: FormGroup;
  submitting: boolean = false;
  unhandledEmailError: firebase.FirebaseError = null;
  oAuthProviderIds: string[] = [];
  hasEmailProvider: boolean = false;
  unhandledOAuthError: firebase.FirebaseError = null;


  constructor(
    protected route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: SimpleFirebaseAuthService,
    private oAuthService: OauthService
  ) { }

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }



  ngOnInit() {
    this.redirect = this.route.snapshot.queryParams.redirect;
    this.id = _.uniqueId('sfa-reauthenticate-route');
    this.fg = this.fb.group({
      email: ['', [Validators.required, Utils.validateEmail]],
      password: ['', [Validators.required]]
    });
    this.fg.get('email').disable();

    this.oAuthService.checkForReauthenticateRedirect()
      .then((event: AuthUserEvent|null) => {
        if (event) {
          this.onReauthSuccess();
        }
      })
      .catch((error: firebase.FirebaseError) => {
        this.unhandledOAuthError = error;
      })

    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User) => {
      this.user = user;
      if (user) {
        this.fg.get('email').setValue(user.email);
        const userProviderIds = _.map(user.providerData, 'providerId');
        this.hasEmailProvider = _.includes(this.authService.configuredProviderIds, 'password') &&
          _.includes(userProviderIds, 'password');
        this.oAuthProviderIds = _.filter(this.authService.oAuthProviderIds, id => {
          return _.includes(userProviderIds, id);
        })
      }
    });
  }

  protected onReauthSuccess() {
    this.authService.navigate(this.redirect, {queryParams: {reauthenticated: 'true'}});
  }

  emailReauth() {
    this.submitting = true;
    this.unhandledEmailError = null;
    const password = this.fg.get('password').value;
    const credential = firebase.auth.EmailAuthProvider.credential(this.user.email, password);
    this.user.reauthenticateWithCredential(credential)
      .then(() => {
        this.onReauthSuccess();
      })
      .catch((error: firebase.FirebaseError) => {
        switch(error.code) {
          case 'auth/wrong-password':
            this.fg.get('password').setErrors(Utils.firebaseToFormError(error))
            break;
          default:
            this.unhandledEmailError = error;
            break;
        }
        this.submitting = false;
      })
  }

  oAuthReauth(providerId) {
    this.unhandledOAuthError = null;
    switch(this.authService.oAuthMethod) {
      case OAuthMethod.popup:
        this.oAuthService.reauthenticateWithPopup(providerId, this.user)
          .then((event: AuthUserEvent| null) => {
            if(event){
              this.onReauthSuccess();
            }
          })
          .catch((error: any) => {
            this.unhandledOAuthError = error;
          });
          break;
        default:
          this.oAuthService.reauthenticateWithRedirect(providerId, this.user)
            .catch((error: firebase.FirebaseError) => {
              this.unhandledOAuthError = error;
            })
            break;

    }
  }

}
