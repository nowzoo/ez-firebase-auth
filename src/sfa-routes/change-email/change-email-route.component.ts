import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import * as _ from '../../utils/lodash-funcs';
import { SfaService } from '../../sfa/sfa.service';
import * as Utils from '../../utils/utils';
import { SfaMessages } from '../messages.enum';
import { SfaBaseComponent } from '../sfa-base.component';

@Component({
  selector: 'sfa-change-email-route',
  templateUrl: './change-email-route.component.html',
  styleUrls: ['./change-email-route.component.scss']
})
export class ChangeEmailRouteComponent extends SfaBaseComponent implements OnInit {

  public user: firebase.User | null = null;
  public fg: FormGroup;
  public id: string;
  public success = false;
  public submitting = false;
  public unhandledError: firebase.FirebaseError | null = null;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected fb: FormBuilder,
    authService: SfaService
  ) {
    super(authService);
  }


  public ngOnInit() {
    this.authService.onRoute('change-email');
    this.id = _.uniqueId('sfa-change-email-route');
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
        this.authService.onEmailChanged({user: user, oldEmail: oldEmail, newEmail: email});
        this.success = true;
        this.submitting = false;
        this.authService.navigate('account', {queryParams: {message: SfaMessages.emailSaved}})
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

  validateNotSame(fc: FormControl) {
    if (! this.user) {
      return null;
    }
    const value = _.trim(fc.value).toLowerCase();
    const curr = _.trim(this.user.email as string).toLowerCase();
    return value === curr ? {same: true} : null;
  }
}
