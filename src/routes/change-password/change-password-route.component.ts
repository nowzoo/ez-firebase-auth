import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import * as Utils from '../utils';

@Component({
  selector: 'sfa-change-password-route',
  templateUrl: './change-password-route.component.html',
  styleUrls: ['./change-password-route.component.scss']
})
export class ChangePasswordRouteComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  user: firebase.User = null;
  hasPasswordProvider: boolean = false;
  fg: FormGroup;
  success: boolean = false;
  submitting: boolean = false;
  unhandledError: firebase.FirebaseError = null;

  constructor(
    protected fb: FormBuilder,
    protected authService: SimpleFirebaseAuthService
  ) { }

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    this.authService.onRouteNext('change-password');
    this.fg = this.fb.group({
      password: ['', [Validators.required]]
    })
    this.fg.get('password').valueChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
      Utils.clearControlErrors(this.fg.get('password'), ['auth/weak-password'])
    })

    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User) => {
      console.log(user)
      if (! user) {
        this.authService.navigate('sign-in');
        return;
      }
      let hasPasswordProvider = _.find(user.providerData,{providerId: 'password'}) ? true : false;
      if (! hasPasswordProvider) {
        this.authService.navigate('account');
        return;
      }
      hasPasswordProvider = _.includes(this.authService.configuredProviderIds,  'password');
      if (! hasPasswordProvider) {
        this.authService.navigate('account');
        return;
      }
      this.user = user;
      this.hasPasswordProvider = true;
    })
  }

  submit() {
    this.unhandledError = null;
    this.submitting = true;
    const oldEmail = this.user.email;
    const password = _.trim(this.fg.get('password').value);
    this.user.updatePassword(password)

      .then(() => {
        return this.user.reload();
      })
      .then(() => {
        this.success = true;
        this.submitting = false;
      })
      .catch((error: firebase.FirebaseError) => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/weak-password':
            this.fg.get('password').setErrors(Utils.firebaseToFormError(error));
            break;
          case 'auth/requires-recent-login':
            this.authService.navigate('reauthenticate', {queryParams: {redirect: 'change-password'}})
            break;
          default:
            this.unhandledError = error;
            break;
        }
      })
  }
}
