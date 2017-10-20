import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/take';
import * as firebase from 'firebase';
import * as _ from '../../utils/lodash-funcs';
import { SfaService } from '../../sfa/sfa.service';
import * as Utils from '../../utils/utils';
import { OUT_OF_BAND_MODES } from '../sfa-routes';

@Component({
  selector: 'sfa-reset-password-route',
  templateUrl: './reset-password-route.component.html',
  styleUrls: ['./reset-password-route.component.scss']
})
export class ResetPasswordRouteComponent implements OnInit, OnDestroy {

  public screen: 'wait' | 'form' | 'error' | 'success' = 'wait';

  public user: firebase.User | null = null;
  public fg: FormGroup;
  public submitting = false;
  public unhandledError: firebase.FirebaseError | null = null;
  public oAuthProviderIds: string[] = [];
  public oobCode: string;
  public email: string | null = null;
  public linkError: firebase.FirebaseError | null = null;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected route: ActivatedRoute,
    protected fb: FormBuilder,
    protected authService: SfaService
  ) { }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public ngOnInit() {
    this.authService.onRoute('reset-password');
    this.fg = this.fb.group({
      password: ['', [Validators.required]]
    });
    const passwordFc = this.fg.get('password') as FormControl;
    passwordFc.valueChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
      Utils.clearControlErrors(passwordFc, ['auth/weak-password']);
    });
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
      });
  }

  public submit() {
    this.linkError = null;
    this.unhandledError = null;
    this.submitting = true;
    const passwordFc = this.fg.get('password') as FormControl;
    const password = passwordFc.value;
    this.authService.auth.confirmPasswordReset(this.oobCode, password)
      .then(() => {
        return this.authService.emailSignIn(this.email as string, password);
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
            passwordFc.setErrors(Utils.firebaseToFormError(error));
            break;
          default:
            this.unhandledError = error;
            break;
        }
      });
  }
}
