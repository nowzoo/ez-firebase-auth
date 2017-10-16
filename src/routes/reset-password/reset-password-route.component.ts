import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/take';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import * as Utils from '../utils';
import { OUT_OF_BAND_MODES } from '../simple-firebase-auth-routes';

@Component({
  selector: 'sfa-reset-password-route',
  templateUrl: './reset-password-route.component.html',
  styleUrls: ['./reset-password-route.component.scss']
})
export class ResetPasswordRouteComponent implements OnInit {

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  screen: 'wait' | 'form' | 'error' | 'success' = 'wait';

  user: firebase.User = null;
  fg: FormGroup;
  submitting: boolean = false;
  unhandledError: firebase.FirebaseError = null;
  oAuthProviderIds: string[] = [];
  oobCode: string;
  email: string = null;
  linkError: firebase.FirebaseError = null;

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
    this.authService.onRouteNext('reset-password');
    this.fg = this.fb.group({
      password: ['', [Validators.required]]
    })
    this.fg.get('password').valueChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
      Utils.clearControlErrors(this.fg.get('password'), ['auth/weak-password'])
    })
    const mode = this.route.snapshot.queryParams.mode || null;
    this.oobCode = this.route.snapshot.queryParams.oobCode || null;
    if ((mode !== OUT_OF_BAND_MODES.resetPassword) || (! this.oobCode)) {
      this.authService.navigate('sign-in');
    }
    this.authService.auth.verifyPasswordResetCode(this.oobCode)
      .then((result) => {
        this.email = result;
        this.screen = 'form';
      })
      .catch((error: firebase.FirebaseError) => {
        this.linkError = error;
        this.screen = 'error';
      })


  }

  submit() {
    this.linkError = null;
    this.unhandledError = null;
    this.submitting = true;
    const password = this.fg.get('password').value;
    this.authService.auth.confirmPasswordReset(this.oobCode, password)
      .then(() => {
        return this.authService.emailSignIn(this.email, password)
      })
      .then((result: firebase.User) => {
        this.user = result;
        this.submitting = false;
        this.screen = 'success';
      })
      .catch((error: firebase.FirebaseError) => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/expired-action-code':
          case 'auth/invalid-action-code':
          case 'auth/user-disabled':
          case 'auth/user-not-found':
            this.linkError = error;
            this.screen = 'error';
            break;
          case 'auth/weak-password':
            this.fg.get('password').setErrors(Utils.firebaseToFormError(error));
            break;
          default:
            this.unhandledError = error;
            break;
        }
      })

  }


}
