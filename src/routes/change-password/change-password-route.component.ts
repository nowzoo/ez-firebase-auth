import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import * as _ from '../../lodash-funcs';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import * as Utils from '../utils';

@Component({
  selector: 'sfa-change-password-route',
  templateUrl: './change-password-route.component.html',
  styleUrls: ['./change-password-route.component.scss']
})
export class ChangePasswordRouteComponent implements OnInit, OnDestroy {

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
    this.authService.onRouteNext('change-password');
    this.fg = this.fb.group({
      password: ['', [Validators.required]]
    });
    const fc: FormControl = this.fg.get('password') as FormControl;
    fc.valueChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
      Utils.clearControlErrors(fc, ['auth/weak-password']);
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
    this.unhandledError = null;
    this.submitting = true;
    const fc: FormControl = this.fg.get('password') as FormControl;
    const user: firebase.User = this.user as firebase.User;
    const oldEmail = user.email;
    const password = _.trim(fc.value);
    user.updatePassword(password)
      .then(() => {
        return user.reload();
      })
      .then(() => {
        this.success = true;
        this.submitting = false;
      })
      .catch((error: firebase.FirebaseError) => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/weak-password':
            fc.setErrors(Utils.firebaseToFormError(error));
            break;
          case 'auth/requires-recent-login':
            this.authService.navigate('reauthenticate', {queryParams: {redirect: 'change-password'}});
            break;
          default:
            this.unhandledError = error;
            break;
        }
      });
  }
}
