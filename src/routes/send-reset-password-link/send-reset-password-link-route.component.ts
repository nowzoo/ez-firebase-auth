import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/take';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import * as Utils from '../utils';

@Component({
  selector: 'sfa-send-reset-password-link-route',
  templateUrl: './send-reset-password-link-route.component.html',
  styleUrls: ['./send-reset-password-link-route.component.scss']
})
export class SendResetPasswordLinkRouteComponent implements OnInit {

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  user: firebase.User = null;
  fg: FormGroup;
  id: string;
  success: boolean = false;
  submitting: boolean = false;
  unhandledError: firebase.FirebaseError = null;
  oAuthProviderIds: string[] = [];

  constructor(
    protected route: ActivatedRoute,
    protected fb: FormBuilder,
    protected authService: SimpleFirebaseAuthService
  ) { }

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    this.authService.onRouteNext('send-reset-password-link');
    this.id = _.uniqueId('sfa-send-reset-password-link');
    this.fg = this.fb.group({
      email: ['', [Validators.required, Utils.validateEmail]]
    })
    this.authService.authState.take(1).subscribe((user: firebase.User) => {
      let email = this.route.snapshot.queryParams.email || '';
      if (! email) {
        email = user ? user.email : '';
      }
      this.fg.get('email').setValue(email);

      this.fg.get('email').valueChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
        Utils.clearControlErrors(this.fg.get('email'), ['auth/invalid-email', 'auth/user-not-found'])
      })
    })

  }

  submit() {
    this.unhandledError = null;
    this.submitting = true;
    const email = _.trim(this.fg.get('email').value);
    this.authService.auth.fetchProvidersForEmail(email)
      .then((providerIds: string[]) => {
        return new Promise((resolve, reject) => {
          if (providerIds.length === 0) {
            return reject({code: 'auth/user-not-found'})
          }
          if (! _.includes(providerIds, 'password')) {
            this.oAuthProviderIds = _.filter(providerIds, id => {
              return id !== 'password';
            })
            return reject({code: 'no-password'})
          }
          return resolve();
        })
      })
      .then(() => {
        this.authService.auth.sendPasswordResetEmail(email)
      })
      .then(() => {
        this.submitting = false;
        this.success = true;
      })
      .catch((error: firebase.FirebaseError) => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/invalid-email':
          case 'auth/user-not-found':
          case 'auth/no-password':
            this.fg.get('email').setErrors(Utils.firebaseToFormError(error));
            break;
          default:
            this.unhandledError = error;
            break;
        }
      })

  }
  reset() {
    this.success = false;
  }

}
