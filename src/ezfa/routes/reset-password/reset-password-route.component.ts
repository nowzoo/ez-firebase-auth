import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import { EzfaService } from '../../ezfa.service';
import * as Utils from '../utils';
import { BaseComponent } from '../base.component';
import { Messages } from '../messages.enum';

@Component({
  selector: 'ezfa-reset-password-route',
  templateUrl: './reset-password-route.component.html',
  styleUrls: ['./reset-password-route.component.scss']
})
export class ResetPasswordRouteComponent extends BaseComponent implements OnInit {

  screen: 'wait' | 'form' | 'error' | 'success' = 'wait';

  id: string = null;
  user: firebase.User | null = null;
  fg: FormGroup;
  submitting = false;
  error: firebase.FirebaseError | null = null;
  oAuthProviderIds: string[] = [];
  oobCode: string;
  email: string | null = null;


  constructor(
    public route: ActivatedRoute,
    public fb: FormBuilder,
    service: EzfaService
  ) {
    super(service);
  }


  ngOnInit() {
    this.id = _.uniqueId('ezfa-reset-password-route');
    this.service.onRouteChange('reset-password');
    this.fg = this.fb.group({
      password: ['', [Validators.required]]
    });
    const passwordFc = this.fg.get('password') as FormControl;
    passwordFc.valueChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
      Utils.clearControlErrors(passwordFc, ['auth/weak-password']);
    });

    this.onInitLoadUser()
      .then(() => {
        this.checkCode();
      });
  }

  submit() {
    this.error = null;
    this.submitting = true;
    const passwordFc = this.fg.get('password') as FormControl;
    const password = passwordFc.value;
    this.service.auth.confirmPasswordReset(this.oobCode, password)
      .then(() => {
        return this.service.auth.signInWithEmailAndPassword(this.email as string, password);
      })
      .then((result: firebase.User) => {
        this.user = result;
        this.submitting = false;
        this.screen = 'success';
        this.service.navigate('account', {queryParams: {message: Messages.passwordReset}});
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

  checkCode() {
    return new Promise<boolean>(resolve => {
      this.oobCode = this.route.snapshot.queryParams.oobCode || null;
      if ((this.route.snapshot.queryParams.mode !== EzfaService.OUT_OF_BAND_MODES.resetPassword) || (! this.oobCode)) {
        this.service.navigate();
        return resolve(false);
      }

      this.service.auth.verifyPasswordResetCode(this.oobCode)
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
    });

  }
}
