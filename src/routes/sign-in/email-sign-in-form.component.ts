import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/debounceTime';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import isEmail from 'validator/lib/isEmail';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import * as Utils from '../utils';

@Component({
  selector: 'sfa-email-sign-in-form',
  templateUrl: './email-sign-in-form.component.html',
  styleUrls: ['./email-sign-in-form.component.scss']
})
export class EmailSignInFormComponent implements OnInit {
  @Input() email: string = '';
  id: string;
  fg: FormGroup;
  signUpFg: FormGroup;
  submitting: boolean = false;
  fetchStatus: 'unfetched' | 'fetched' | 'fetching' = 'unfetched';
  accountExists: boolean = false;
  accountExistsWithoutPassword: boolean = false;

  accountOAuthProviders: string[] = [];
  unhandledError: firebase.FirebaseError = null;

  constructor(
    private fb: FormBuilder,
    private authService: SimpleFirebaseAuthService
  ) { }

  ngOnInit() {
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

    this.fg.get('email').valueChanges.subscribe(() => {
      Utils.clearControlErrors(this.fg.get('email'), [
        'auth/invalid-email',
        'sfa/provider-not-configured',
        'sfa/no-password-for-user',
        'auth/email-already-in-use',
        'auth/operation-not-allowed',
        'auth/user-disabled',
        'auth/user-not-found'
      ]);
    })
    const ctrl = this.fg.get('email');

    ctrl.valueChanges.combineLatest(ctrl.statusChanges).debounceTime(250).subscribe(() => {
      this.fetchAccountByEmail()
    });
    this.fg.get('password').valueChanges.subscribe(() => {
      Utils.clearControlErrors(this.fg.get('password'), ['auth/wrong-password', 'auth/weak-password']);
    })
    this.fetchAccountByEmail()
  }

  protected fetchAccountByEmail () {
    const ctrl = this.fg.get('email');
    if (ctrl.invalid){
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
        this.accountOAuthProviders = _.filter(providerIds, id => {
          return _.includes(this.authService.oAuthProviderIds, id);
        });
      })
  }



  submit() {
    const email = _.trim(this.fg.get('email').value).toLowerCase();
    const password = this.fg.get('password').value;
    const name = this.signUpFg.get('name') ? this.signUpFg.get('name').value : null;

    let user: firebase.User;
    this.submitting = true;
    this.unhandledError = null;
    this.authService.emailSignIn(email, password, name)
      .then((result: firebase.User) => {
        user = result;
        this.submitting = false;
      })
      .catch((error: firebase.FirebaseError) => {
        switch(error.code){
          case 'auth/invalid-email':
          case 'auth/user-disabled':
            this.fg.get('email').setErrors(Utils.firebaseToFormError(error));
            break;
          case 'auth/wrong-password':
          case 'auth/weak-password':
            this.fg.get('password').setErrors(Utils.firebaseToFormError(error));
            break;
          default:
            this.unhandledError = error;
            break;
        }
        this.submitting = false;
      })
  }



}
