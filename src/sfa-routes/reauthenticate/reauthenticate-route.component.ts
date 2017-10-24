import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import * as _ from 'lodash';
import * as firebase from 'firebase';
import { SfaService } from '../../sfa/sfa.service';
import { OauthService } from '../oauth.service';
import { IAuthUserEvent } from '../../sfa/sfa';
import { OAuthMethod } from '../../sfa/sfa';
import * as Utils from '../../utils/utils';
import { SfaBaseComponent } from '../sfa-base.component';
import { UserProviderData } from '../user-provider-data.class';

@Component({
  selector: 'sfa-reauthenticate-route',
  templateUrl: './reauthenticate-route.component.html',
  styleUrls: ['./reauthenticate-route.component.scss']
})
export class ReauthenticateRouteComponent extends SfaBaseComponent implements OnInit, OnDestroy {

  redirect: string | null = null;
  id: string;
  user: firebase.User | null;
  fg: FormGroup;
  submitting = false;
  unhandledEmailError: firebase.FirebaseError | null = null;
  unhandledOAuthError: firebase.FirebaseError | null = null;
  userProviderData: UserProviderData;

  constructor(
    protected route: ActivatedRoute,
    protected fb: FormBuilder,
    protected oAuthService: OauthService,
    authService: SfaService
  ) {
    super(authService)
   }


  ngOnInit() {
    this.redirect = this.route.snapshot.queryParams.redirect;
    this.id = _.uniqueId('sfa-reauthenticate-route');
    this.fg = this.fb.group({
      email: ['', [Validators.required, Utils.validateEmail]],
      password: ['', [Validators.required]]
    });
    const fcEmail = this.fg.get('email') as FormControl;
    const fcPassword = this.fg.get('password') as FormControl;
    fcEmail.disable();
    fcPassword.valueChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
      Utils.clearControlErrors(fcPassword, ['auth/wrong-password']);
    });

    this.onInitLoadUser()
      .then(() => {
        return this.checkForRedirect()
      })
      .then(() => {
        this.gateToSignedInUser();
      })
  }

  emailReauth() {
    if (! this.user) {
      return;
    }
    this.submitting = true;
    this.unhandledEmailError = null;
    const fcPassword = this.fg.get('password') as FormControl;
    const password = fcPassword.value;
    const user = this.user as firebase.User;
    const credential = firebase.auth.EmailAuthProvider.credential(user.email as string, password);
    user.reauthenticateWithCredential(credential)
      .then(() => {
        this.submitting = false;
        this.onReauthSuccess();
      })
      .catch((error: firebase.FirebaseError) => {
        switch (error.code) {
          case 'auth/wrong-password':
            fcPassword.setErrors(Utils.firebaseToFormError(error));
            break;
          default:
            this.unhandledEmailError = error;
            break;
        }
        this.submitting = false;
      });
  }

  oAuthReauth(providerId: string) {
    if (! this.user) {
      return;
    }
    this.unhandledOAuthError = null;
    const user = this.user as firebase.User;
    switch (this.authService.oAuthMethod) {
      case OAuthMethod.popup:
        this.oAuthService.reauthenticateWithPopup(providerId, user)
          .then((event: IAuthUserEvent| null) => {
            if (event) {
              this.onReauthSuccess();
            }
          })
          .catch((error: any) => {
            this.unhandledOAuthError = error;
          });
        break;
        default:
          this.oAuthService.reauthenticateWithRedirect(providerId, user)
            .catch((error: firebase.FirebaseError) => {
              this.unhandledOAuthError = error;
            });
          break;
    }
  }

  protected onReauthSuccess() {
    this.authService.navigate(this.redirect, {queryParams: {reauthenticated: 'true'}});
  }

  protected checkForRedirect() {
    return new Promise<boolean>(resolve => {
      this.oAuthService.checkForReauthenticateRedirect()
        .then((event: IAuthUserEvent | null) => {
          if (event) {
            this.onReauthSuccess();
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((error: firebase.FirebaseError) => {
          this.unhandledOAuthError = error;
          resolve(true);
        });
    })
  }

}
