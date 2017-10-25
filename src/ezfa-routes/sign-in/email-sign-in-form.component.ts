import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/debounceTime';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import { EzfaService } from '../../ezfa/ezfa.service';
import * as Utils from '../../utils/utils';
import { BaseComponent } from '../base.component';
import { SfaMessages } from '../messages.enum';
@Component({
  selector: 'ezfa-email-sign-in-form',
  templateUrl: './email-sign-in-form.component.html',
  styleUrls: ['./email-sign-in-form.component.scss']
})
export class EmailSignInFormComponent extends BaseComponent implements OnInit {
  @Input() public email = '';
  public id: string;
  public fg: FormGroup;
  public signUpFg: FormGroup;
  public submitting = false;
  public fetchStatus: 'unfetched' | 'fetched' | 'fetching' = 'unfetched';
  public accountExists = false;
  public accountExistsWithoutPassword = false;
  public accountOAuthProviders: string[] = [];
  public unhandledError: firebase.FirebaseError | null = null;

  constructor(
    protected fb: FormBuilder,
    authService: EzfaService
  ) {
    super(authService)
  }

  public ngOnInit() {
    this.id = _.uniqueId('ezfa-email-sign-in-form');
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

    const email = _.trim(this.fg.get('email').value).toLowerCase();
    const password = this.fg.get('password').value;
    const name = this.accountExists ? null : _.trim(this.signUpFg.get('name').value);

    let user: firebase.User;
    this.submitting = true;
    this.unhandledError = null;

    this.authService.getProviderById('password')
      .then(() => {
        if (! this.accountExists) {
          return this.authService.auth.createUserWithEmailAndPassword(email, password);
        }
      })
      .then(() => {
        return this.authService.auth.signInWithEmailAndPassword(email, password);
      })
      .then((result: firebase.User) => {
        user = result;
        if ((! this.accountExists) && this.authService.requireDisplayName) {
          return user.updateProfile({displayName: name, photoURL: null});
        }
      })
      .then(() => {
        if ((! this.accountExists) && this.authService.sendEmailVerificationLink) {
          return user.sendEmailVerification();
        }
      })
      .then(() => {
        this.authService.authRedirectCancelled = false;
        this.authService.onSignedIn({
          user: user,
          providerId: 'password'
        });
        if (! this.authService.authRedirectCancelled) {
          this.authService.navigate(null, {queryParams: {message: SfaMessages.signedIn}});
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
      })
      .catch(() => {
        this.fetchStatus = 'unfetched';
        this.accountExists = false;
        this.accountExistsWithoutPassword = false;
        this.accountOAuthProviders = [];
      })
  }

}
