import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import * as Utils from '../utils';
@Component({
  selector: 'sfa-change-email-route',
  templateUrl: './change-email-route.component.html',
  styleUrls: ['./change-email-route.component.scss']
})
export class ChangeEmailRouteComponent implements OnInit, OnDestroy {
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
    this.authService.onRouteNext('change-email');

    this.fg = this.fb.group({
      email: ['', [Validators.required, Utils.validateEmail, (fc: FormControl) => {
        if (! this.user) {
          return null;
        }
        const value = _.trim(fc.value).toLowerCase();
        const curr = _.trim(this.user.email).toLowerCase();
        return value === curr ? {same: true} : null;
      }]]
    })
    this.fg.get('email').valueChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
      Utils.clearControlErrors(this.fg.get('email'), ['auth/invalid-email', 'auth/email-already-in-use'])
    })

    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User) => {
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
    const email = _.trim(this.fg.get('email').value);
    this.user.updateEmail(email)
      .then(() => {
        if (this.authService.sendEmailVerificationLink){
          return this.user.sendEmailVerification();
        }
      })
      .then(() => {
        return this.user.reload();
      })
      .then(() => {
        this.authService.onEmailChangedNext({user: this.user, oldEmail: oldEmail, newEmail: email});
        this.success = true;
        this.submitting = false;
      })
      .catch((error: firebase.FirebaseError) => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/invalid-email':
          case 'auth/email-already-in-use':
            this.fg.get('email').setErrors(Utils.firebaseToFormError(error));
            break;
          case 'auth/requires-recent-login':
            this.authService.navigate('reauthenticate', {queryParams: {redirect: 'change-email'}})
            break;
          default:
            this.unhandledError = error;
            break;
        }
      })

  }



}
