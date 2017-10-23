import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import * as _ from '../../utils/lodash-funcs';
import { SfaService } from '../../sfa/sfa.service';
import * as Utils from '../../utils/utils';
import { OUT_OF_BAND_MODES } from '../sfa-routes';
import { SfaBaseComponent } from '../sfa-base.component';
import { SfaMessages } from '../messages.enum';

@Component({
  selector: 'sfa-reset-password-route',
  templateUrl: './reset-password-route.component.html',
  styleUrls: ['./reset-password-route.component.scss']
})
export class ResetPasswordRouteComponent extends SfaBaseComponent implements OnInit {

  screen: 'wait' | 'form' | 'error' | 'success' = 'wait';

  id: string = null;
  user: firebase.User | null = null;
  fg: FormGroup;
  submitting = false;
  error: firebase.FirebaseError | null = null;
  oAuthProviderIds: string[] = [];
  oobCode: string;
  email: string | null = null;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected route: ActivatedRoute,
    protected fb: FormBuilder,
    authService: SfaService
  ) {
    super(authService)
  }


  ngOnInit() {
    this.id = _.uniqueId('sfa-reset-password-route');
    this.authService.onRoute('reset-password');
    this.fg = this.fb.group({
      password: ['', [Validators.required]]
    });
    const passwordFc = this.fg.get('password') as FormControl;
    passwordFc.valueChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
      Utils.clearControlErrors(passwordFc, ['auth/weak-password']);
    });

    this.onInitLoadUser()
      .then(() => {
        this.checkForCode();
      })
  }

  submit() {
    this.error = null;
    this.submitting = true;
    const passwordFc = this.fg.get('password') as FormControl;
    const password = passwordFc.value;
    this.authService.auth.confirmPasswordReset(this.oobCode, password)
      .then(() => {
        return this.authService.auth.signInWithEmailAndPassword(this.email as string, password);
      })
      .then((result: firebase.User) => {
        this.user = result;
        this.submitting = false;
        this.screen = 'success';
        this.authService.navigate('account', {queryParams: {message: SfaMessages.passwordReset}});
      })
      .catch((error: firebase.FirebaseError) => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/weak-password':
            passwordFc.setErrors(Utils.firebaseToFormError(error));
            this.screen = 'form';
            break;
          default:
            this.error = error;
            this.screen = 'error';
            break;
        }
      });
  }

  protected checkForCode() {
    return new Promise<boolean>(resolve => {
      this.oobCode = this.route.snapshot.queryParams.oobCode || null;
      if ((this.route.snapshot.queryParams.mode !== OUT_OF_BAND_MODES.resetPassword) || (! this.oobCode)) {
        this.authService.navigate();
        return resolve(false);
      }

      this.authService.auth.verifyPasswordResetCode(this.oobCode)
        .then((email: string) => {
          this.email = email;
          this.screen = 'form';
          resolve(true);
        })
        .catch((error: firebase.FirebaseError) => {
          this.error = error;
          this.screen = 'error';
          resolve(true);
        });
    })

  }
}
