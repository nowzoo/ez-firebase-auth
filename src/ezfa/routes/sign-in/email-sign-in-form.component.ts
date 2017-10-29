import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/debounceTime';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import { EzfaService } from '../../ezfa.service';
import { EzfaSignedInEvent } from '../../ezfa-signed-in-event.class';
import * as Utils from '../utils';
import { BaseComponent } from '../base.component';
import { Messages } from '../messages.enum';
@Component({
  selector: 'ezfa-email-sign-in-form',
  templateUrl: './email-sign-in-form.component.html',
  styleUrls: ['./email-sign-in-form.component.scss']
})
export class EmailSignInFormComponent extends BaseComponent implements OnInit {
  static FETCH_TIMEOUT = 500;
  @Input() email = '';
  id: string;
  fg: FormGroup;
  signUpFg: FormGroup;
  submitting = false;
  fetchStatus: 'unfetched' | 'fetched' | 'fetching' = 'unfetched';
  accountExists = false;
  accountExistsWithoutPassword = false;
  accountOauthProviders: string[] = [];
  unhandledError: firebase.FirebaseError | null = null;

  constructor(
    public fb: FormBuilder,
    service: EzfaService
  ) {
    super(service);
  }

  ngOnInit() {
    this.id = _.uniqueId('ezfa-email-sign-in-form');
    this.fg = this.fb.group({
      email: [this.email || '', [Validators.required, Utils.validateEmail]],
      password: ['', [Validators.required]]
    });
    this.signUpFg = this.fb.group({});
    if (this.service.requireDisplayName) {
      this.signUpFg.addControl('name', this.fb.control('', [Validators.required]));
    }
    if (this.service.requireTos) {
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

    emailFc.valueChanges.combineLatest(emailFc.statusChanges)
    .debounceTime(EmailSignInFormComponent.FETCH_TIMEOUT).subscribe(() => {
      this.fetchAccountByEmail();
    });
    passwordControl.valueChanges.subscribe(() => {
      Utils.clearControlErrors(passwordControl, ['auth/wrong-password', 'auth/weak-password']);
    });
    this.fetchAccountByEmail();
  }

  submit() {

    const email = _.trim(this.fg.get('email').value).toLowerCase();
    const password = this.fg.get('password').value;
    const name = this.accountExists ? null : _.trim(this.signUpFg.get('name').value);

    let user: firebase.User;
    this.submitting = true;
    this.unhandledError = null;

    this.service.getProviderById('password')
      .then(() => {
        if (! this.accountExists) {
          return this.service.auth.createUserWithEmailAndPassword(email, password);
        }
      })
      .then(() => {
        return this.service.auth.signInWithEmailAndPassword(email, password);
      })
      .then((result: firebase.User) => {
        user = result;
        if ((! this.accountExists) && this.service.requireDisplayName) {
          return user.updateProfile({displayName: name, photoURL: null});
        }
      })
      .then(() => {
        if ((! this.accountExists) && this.service.sendEmailVerificationLink) {
          return user.sendEmailVerification();
        }
      })
      .then(() => {
        const event = new EzfaSignedInEvent(user, 'password');
        this.service.onSignedIn(event);
        if (! event.redirectCancelled) {
          this.service.navigate(null, {queryParams: {message: Messages.signedIn}});
        }
      })
      .catch ((error: firebase.FirebaseError) => {
        switch (error.code) {
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
      });
  }



  fetchAccountByEmail() {
    const ctrl = this.fg.get('email') as FormControl;
    if (ctrl.invalid) {
      this.fetchStatus = 'unfetched';
      this.accountExists = false;
      this.accountExistsWithoutPassword = false;
      this.accountOauthProviders = [];
      return;
    }
    this.service.auth.fetchProvidersForEmail(ctrl.value)
      .then((providerIds: string[]) => {
        this.fetchStatus = 'fetched';
        if (providerIds.length === 0) {
          this.accountExists = false;
          this.accountExistsWithoutPassword = false;
          this.accountOauthProviders = [];
          return;
        }
        this.accountExists = true;
        if (_.includes(providerIds, 'password')) {
          this.accountExistsWithoutPassword = false;
          this.accountOauthProviders = [];
          return;
        }
        this.accountExistsWithoutPassword = true;
        this.accountOauthProviders = _.filter(providerIds, (id) => {
          return _.includes(this.service.providerIds, id);
        });
      })
      .catch(() => {
        this.fetchStatus = 'unfetched';
        this.accountExists = false;
        this.accountExistsWithoutPassword = false;
        this.accountOauthProviders = [];
      });
  }

}
