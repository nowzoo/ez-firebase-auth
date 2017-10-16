import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import * as _ from 'lodash';
import * as firebase from 'firebase';


import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import { OauthService } from '../oauth.service';
import { AuthUserEvent, OAuthMethod } from '../../simple-firebase-auth';
import * as Utils from '../utils';

@Component({
  selector: 'sfa-reauth-form',
  templateUrl: './reauth-form.component.html',
  styleUrls: ['./reauth-form.component.scss']
})
export class ReauthFormComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  @Input() shown: boolean;
  @Output() reauthenticated: EventEmitter<void> = new EventEmitter<void>();
  user: firebase.User;
  fg: FormGroup;
  submitting: boolean = false;
  unhandledEmailError: firebase.FirebaseError = null;
  oAuthProviderIds: string[] = [];
  hasEmailProvider: boolean = false;
  unhandledOAuthError: firebase.FirebaseError = null;
  constructor(
    private fb: FormBuilder,
    private authService: SimpleFirebaseAuthService,
    private oAuthService: OauthService
  ) { }

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    this.fg = this.fb.group({
      email: ['', [Validators.required, Utils.validateEmail]],
      password: ['', [Validators.required]]
    });
    this.fg.get('email').disable();

    this.oAuthService.checkForReauthenticateRedirect()
      .then((event: AuthUserEvent|null) => {
        if(event) {
          this.reauthenticated.emit();
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

  emailReauth() {
    this.submitting = true;
    this.unhandledEmailError = null;
    const password = this.fg.get('password').value;
    const credential = firebase.auth.EmailAuthProvider.credential(this.user.email, password);
    this.user.reauthenticateWithCredential(credential)
      .then(() => {
        this.reauthenticated.emit();
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
              this.reauthenticated.emit()
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
