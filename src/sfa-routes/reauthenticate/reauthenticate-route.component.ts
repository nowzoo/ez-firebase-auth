import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import * as _ from '../../utils/lodash-funcs';
import * as firebase from 'firebase';
import { SfaService } from '../../sfa/sfa.service';
import { OauthService } from '../oauth.service';
import { IAuthUserEvent } from '../../sfa/sfa';
import { OAuthMethod } from '../../sfa/sfa';
import * as Utils from '../../utils/utils';

@Component({
  selector: 'sfa-reauthenticate-route',
  templateUrl: './reauthenticate-route.component.html',
  styleUrls: ['./reauthenticate-route.component.scss']
})
export class ReauthenticateRouteComponent implements OnInit, OnDestroy {

  public redirect: string | null = null;
  public id: string;
  public user: firebase.User | null = null;
  public fg: FormGroup;
  public submitting = false;
  public unhandledEmailError: firebase.FirebaseError | null = null;
  public oAuthProviderIds: string[] = [];
  public hasEmailProvider = false;
  public unhandledOAuthError: firebase.FirebaseError | null = null;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected route: ActivatedRoute,
    protected fb: FormBuilder,
    protected authService: SfaService,
    protected oAuthService: OauthService
  ) { }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public ngOnInit() {
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

    this.oAuthService.checkForReauthenticateRedirect()
      .then((event: IAuthUserEvent | null) => {
        if (event) {
          this.onReauthSuccess();
        }
      })
      .catch((error: firebase.FirebaseError) => {
        this.unhandledOAuthError = error;
      });

    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User) => {
      this.user = user;
      if (user) {
        fcEmail.setValue(user.email);
        const userProviderIds = _.map(user.providerData, 'providerId');
        this.hasEmailProvider = _.includes(this.authService.configuredProviderIds, 'password') &&
          _.includes(userProviderIds, 'password');
        this.oAuthProviderIds = _.filter(this.authService.oAuthProviderIds, (id) => {
          return _.includes(userProviderIds, id);
        });
      }
    });
  }

  public emailReauth() {
    this.submitting = true;
    this.unhandledEmailError = null;
    const fcPassword = this.fg.get('password') as FormControl;
    const password = fcPassword.value;
    const user = this.user as firebase.User;
    const credential = firebase.auth.EmailAuthProvider.credential(user.email as string, password);
    user.reauthenticateWithCredential(credential)
      .then(() => {
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

  public oAuthReauth(providerId: string) {
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
    this.authService.navigate(this.redirect || '', {queryParams: {reauthenticated: 'true'}});
  }

}
