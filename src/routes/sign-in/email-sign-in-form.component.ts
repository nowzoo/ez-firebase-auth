import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/debounceTime';
import * as _ from '../../lodash-funcs';
import * as firebase from 'firebase';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import * as Utils from '../utils';

@Component({
  selector: 'sfa-email-sign-in-form',
  templateUrl: './email-sign-in-form.component.html',
  styleUrls: ['./email-sign-in-form.component.scss']
})
export class EmailSignInFormComponent implements OnInit {
  @Input() public email: string = '';
  public id: string;
  public fg: FormGroup;
  public signUpFg: FormGroup;
  public submitting: boolean = false;
  public fetchStatus: 'unfetched' | 'fetched' | 'fetching' = 'unfetched';
  public accountExists: boolean = false;
  public accountExistsWithoutPassword: boolean = false;
  public accountOAuthProviders: string[] = [];
  public unhandledError: firebase.FirebaseError | null = null;

  constructor(
    protected fb: FormBuilder,
    protected authService: SimpleFirebaseAuthService
  ) { }

  public ngOnInit() {
    this.id = _.uniqueId('sfa-email-sign-in-form');
    this.fg = this.fb.group({
      email: [this.email || '', [Validators.required, Utils.validateEmail]],
      password: ['', [Validators.required]]
    });
    this.signUpFg = this.fb.group({});
    if (this.authService.requireDisplayName) {
      this.signUpFg.addControl('name', this.fb.control('', [Validators.required]));
    }
    if (this.authService.requireTos) {
      this.signUpFg.addControl('tos', this.fb.control(false, [Validators.requiredTrue]));
    }
    const emailFc = this.fg.get('email') as FormControl;
    const passwordControl = this.fg.get('password') as FormControl;

    emailFc.valueChanges.subscribe(() => {
      Utils.clearControlErrors(emailFc, [
        'auth/invalid-email',
        'sfa/provider-not-configured',
        'sfa/no-password-for-user',
        'auth/email-already-in-use',
        'auth/operation-not-allowed',
        'auth/user-disabled',
        'auth/user-not-found'
      ]);
    });

    emailFc.valueChanges.combineLatest(emailFc.statusChanges).debounceTime(250).subscribe(() => {
      this.fetchAccountByEmail();
    });
    passwordControl.valueChanges.subscribe(() => {
      Utils.clearControlErrors(passwordControl, ['auth/wrong-password', 'auth/weak-password']);
    });
    this.fetchAccountByEmail();
  }

  public submit() {
    const emailFc = this.fg.get('email') as FormControl;
    const passwordControl = this.fg.get('password') as FormControl;
    const nameControl = this.signUpFg.get('name') ? this.signUpFg.get('name') as FormControl : null;

    const email = _.trim(emailFc.value).toLowerCase();
    const password = passwordControl.value;
    const name = nameControl ? nameControl.value : null;

    let user: firebase.User;
    this.submitting = true;
    this.unhandledError = null;
    this.authService.emailSignIn(email, password, name)
      .then((result: firebase.User) => {
        user = result;
        this.submitting = false;
      })
      .catch((error: firebase.FirebaseError) => {
        switch (error.code) {
          case 'auth/invalid-email':
          case 'auth/user-disabled':
            emailFc.setErrors(Utils.firebaseToFormError(error));
            break;
          case 'auth/wrong-password':
          case 'auth/weak-password':
            passwordControl.setErrors(Utils.firebaseToFormError(error));
            break;
          default:
            this.unhandledError = error;
            break;
        }
        this.submitting = false;
      });
  }

  protected fetchAccountByEmail() {
    const ctrl = this.fg.get('email') as FormControl;
    if (ctrl.invalid) {
      this.fetchStatus = 'unfetched';
      this.accountExists = false;
      this.accountExistsWithoutPassword = false;
      this.accountOAuthProviders = [];
      return;
    }
    this.authService.auth.fetchProvidersForEmail(ctrl.value)
      .then((providerIds: string[]) => {
        this.fetchStatus = 'fetched';
        if (providerIds.length === 0) {
          this.accountExists = false;
          this.accountExistsWithoutPassword = false;
          this.accountOAuthProviders = [];
          return;
        }
        this.accountExists = true;
        if (_.includes(providerIds, 'password')) {
          this.accountExistsWithoutPassword = false;
          this.accountOAuthProviders = [];
          return;
        }
        this.accountExistsWithoutPassword = true;
        this.accountOAuthProviders = _.filter(providerIds, (id) => {
          return _.includes(this.authService.oAuthProviderIds, id);
        });
      });
  }

}
