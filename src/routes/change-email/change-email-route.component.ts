import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import * as _ from '../../lodash-funcs';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import * as Utils from '../utils';
@Component({
  selector: 'sfa-change-email-route',
  templateUrl: './change-email-route.component.html',
  styleUrls: ['./change-email-route.component.scss']
})
export class ChangeEmailRouteComponent implements OnInit, OnDestroy {

  public user: firebase.User | null = null;
  public hasPasswordProvider: boolean = false;
  public fg: FormGroup;
  public success: boolean = false;
  public submitting: boolean = false;
  public unhandledError: firebase.FirebaseError | null = null;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected fb: FormBuilder,
    protected authService: SimpleFirebaseAuthService
  ) { }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public ngOnInit() {
    this.authService.onRouteNext('change-email');

    this.fg = this.fb.group({
      email: ['', [Validators.required, Utils.validateEmail, (fc: FormControl) => {
        if (! this.user) {
          return null;
        }
        const value = _.trim(fc.value).toLowerCase();
        const curr = _.trim(this.user.email as string).toLowerCase();
        return value === curr ? {same: true} : null;
      }]]
    });
    const fc: FormControl = this.fg.get('email') as FormControl;
    fc.valueChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
      Utils.clearControlErrors(fc, ['auth/invalid-email', 'auth/email-already-in-use']);
    });

    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User) => {
      if (! user) {
        this.authService.navigate('sign-in');
        return;
      }
      let hasPasswordProvider = _.find(user.providerData, {providerId: 'password'}) ? true : false;
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
    });
  }

  public submit() {
    if (! this.user) {
      return;
    }
    this.unhandledError = null;
    this.submitting = true;
    const oldEmail = this.user.email as string;
    const fc = this.fg.get('email') as FormControl;
    const email = _.trim(fc.value) as string;
    const user = this.user as firebase.User;
    this.user.updateEmail(email)
      .then(() => {
        if (this.authService.sendEmailVerificationLink) {
          return user.sendEmailVerification();
        }
      })
      .then(() => {
        return user.reload();
      })
      .then(() => {
        this.authService.onEmailChangedNext({user: user, oldEmail: oldEmail, newEmail: email});
        this.success = true;
        this.submitting = false;
      })
      .catch((error: firebase.FirebaseError) => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/invalid-email':
          case 'auth/email-already-in-use':
            fc.setErrors(Utils.firebaseToFormError(error));
            break;
          case 'auth/requires-recent-login':
            this.authService.navigate('reauthenticate', {queryParams: {redirect: 'change-email'}});
            break;
          default:
            this.unhandledError = error;
            break;
        }
      });
  }
}
