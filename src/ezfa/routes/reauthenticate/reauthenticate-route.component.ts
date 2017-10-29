import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/takeUntil';

import * as _ from 'lodash';
import * as firebase from 'firebase';
import { EzfaService } from '../../ezfa.service';
import { EzfaOauthMethod } from '../../ezfa-oauth-method.enum';
import * as Utils from '../utils';
import { BaseComponent } from '../base.component';
import { UserProviderData } from '../user-provider-data.class';

@Component({
  selector: 'ezfa-reauthenticate-route',
  templateUrl: './reauthenticate-route.component.html',
  styleUrls: ['./reauthenticate-route.component.scss']
})
export class ReauthenticateRouteComponent extends BaseComponent implements OnInit, OnDestroy {

  redirect: string | null = null;
  id: string;
  user: firebase.User | null;
  fg: FormGroup;
  submitting = false;
  unhandledEmailError: firebase.FirebaseError | null = null;
  unhandledOAuthError: firebase.FirebaseError | null = null;
  userProviderData: UserProviderData;

  constructor(
    public route: ActivatedRoute,
    public fb: FormBuilder,
    service: EzfaService
  ) {
    super(service);
  }

  ngOnInit() {
    this.service.onRouteChange('reauthenticate');
    this.redirect = this.route.snapshot.queryParams.redirect;
    this.id = _.uniqueId('ezfa-reauthenticate-route');
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
    this.service.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User | null) => {
      const value = user ? user.email : '';
      fcEmail.setValue(value);
    });

    this.onInitLoadUser()
      .then(() => {
        return this.checkForRedirect();
      })
      .then(() => {
        this.gateToSignedInUser();
      });
  }


  emailReauth() {
    if (! this.user) {
      return this.service.navigate();
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

  oauthReauth(providerId: string) {
    if (! this.user) {
      return this.service.navigate();
    }
    this.unhandledOAuthError = null;
    this.service.getProviderById(providerId)
      .then((provider) => {
        switch (this.service.oauthMethod) {
          case EzfaOauthMethod.popup:
            this.user.reauthenticateWithPopup(provider)
              .then((credential: firebase.auth.UserCredential) => {
                this.onReauthSuccess();
              })
              .catch((error: any) => {
                this.unhandledOAuthError = error;
              });
            break;
            default:
              this.user.reauthenticateWithRedirect(provider)
                .catch((error: firebase.FirebaseError) => {
                  this.unhandledOAuthError = error;
                });
              break;
        }
      });
  }

  checkForRedirect() {
    return new Promise<boolean>(resolve => {
      this.service.auth.getRedirectResult()
        .then((credential: firebase.auth.UserCredential) => {
          if (credential.user) {
            this.onReauthSuccess();
            return resolve(true);
          } else {
            return resolve(false);
          }
        })
        .catch((error: firebase.FirebaseError) => {
          this.unhandledOAuthError = error;
          resolve(true);
        });
    });
  }

  onReauthSuccess() {
    this.service.navigate(this.redirect, {queryParams: {reauthenticated: 'true'}});
  }
}
