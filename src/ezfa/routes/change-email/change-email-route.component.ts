import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import { EzfaService } from '../../ezfa.service';
import * as Utils from '../utils';
import { Messages } from '../messages.enum';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'ezfa-change-email-route',
  templateUrl: './change-email-route.component.html',
  styleUrls: ['./change-email-route.component.scss']
})
export class ChangeEmailRouteComponent extends BaseComponent implements OnInit {

  user: firebase.User | null = null;
  fg: FormGroup;
  id: string;
  success = false;
  submitting = false;
  unhandledError: firebase.FirebaseError | null = null;


  constructor(
    protected fb: FormBuilder,
    service: EzfaService
  ) {
    super(service);
  }


  ngOnInit() {
    this.service.onRouteChange('change-email');
    this.id = _.uniqueId('ezfa-change-email-route');
    this.fg = this.fb.group({
      email: ['', [Validators.required, Utils.validateEmail, this.validateNotSame.bind(this)]]
    });
    const fc: FormControl = this.fg.get('email') as FormControl;
    fc.valueChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
      Utils.clearControlErrors(fc, ['auth/invalid-email', 'auth/email-already-in-use']);
    });
    this.onInitLoadUser()
      .then(() => {
        this.gateToUserWithPassword();
      });
  }

  submit() {
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
        if (this.service.sendEmailVerificationLink) {
          return user.sendEmailVerification();
        }
      })
      .then(() => {
        return user.reload();
      })
      .then(() => {
        this.service.onEmailChanged({user: user, oldEmail: oldEmail, newEmail: email});
        this.success = true;
        this.submitting = false;
        this.service.navigate('account', {queryParams: {message: Messages.emailSaved}});
      })
      .catch((error: firebase.FirebaseError) => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/invalid-email':
          case 'auth/email-already-in-use':
            fc.setErrors(Utils.firebaseToFormError(error));
            break;
          case 'auth/requires-recent-login':
            this.service.navigate('reauthenticate', {queryParams: {redirect: 'change-email'}});
            break;
          default:
            this.unhandledError = error;
            break;
        }
      });
  }

  validateNotSame(fc: FormControl) {
    if (! this.user) {
      return null;
    }
    const value = _.trim(fc.value).toLowerCase();
    const curr = _.trim(this.user.email as string).toLowerCase();
    return value === curr ? {same: true} : null;
  }
}
