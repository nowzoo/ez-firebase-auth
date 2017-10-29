import { Component, OnInit } from '@angular/core';
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
  selector: 'ezfa-change-password-route',
  templateUrl: './change-password-route.component.html',
  styleUrls: ['./change-password-route.component.scss']
})
export class ChangePasswordRouteComponent extends BaseComponent implements OnInit {

  user: firebase.User | null = null;
  hasPasswordProvider = false;
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
    this.id = _.uniqueId('ezfa-change-password-route');
    this.service.onRouteChange('change-password');
    this.fg = this.fb.group({
      password: ['', [Validators.required]]
    });
    const fc: FormControl = this.fg.get('password') as FormControl;
    fc.valueChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
      Utils.clearControlErrors(fc, ['auth/weak-password']);
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
    const fc: FormControl = this.fg.get('password') as FormControl;
    const user: firebase.User = this.user as firebase.User;
    const password = fc.value;
    user.updatePassword(password)
      .then(() => {
        return user.reload();
      })
      .then(() => {
        this.success = true;
        this.submitting = false;
        this.service.navigate('account', {queryParams: {message: Messages.passwordSaved}});
      })
      .catch((error: firebase.FirebaseError) => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/weak-password':
            fc.setErrors(Utils.firebaseToFormError(error));
            break;
          case 'auth/requires-recent-login':
            this.service.navigate('reauthenticate', {queryParams: {redirect: 'change-password'}});
            break;
          default:
            this.unhandledError = error;
            break;
        }
      });
  }
}
