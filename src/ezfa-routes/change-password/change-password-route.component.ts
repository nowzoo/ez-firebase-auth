import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import { EzfaService } from '../../ezfa/ezfa.service';
import * as Utils from '../../utils/utils';
import { SfaMessages } from '../messages.enum';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'ezfa-change-password-route',
  templateUrl: './change-password-route.component.html',
  styleUrls: ['./change-password-route.component.scss']
})
export class ChangePasswordRouteComponent extends BaseComponent implements OnInit {

  public user: firebase.User | null = null;
  public hasPasswordProvider = false;
  public fg: FormGroup;
  public id: string;
  public success = false;
  public submitting = false;
  public unhandledError: firebase.FirebaseError | null = null;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected fb: FormBuilder,
    authService: EzfaService
  ) {
    super(authService);
  }



  public ngOnInit() {
    this.id = _.uniqueId('ezfa-change-password-route')
    this.authService.onRoute('change-password');
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

  public submit() {
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
        this.authService.navigate('account', {queryParams: {message: SfaMessages.passwordSaved}});
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
