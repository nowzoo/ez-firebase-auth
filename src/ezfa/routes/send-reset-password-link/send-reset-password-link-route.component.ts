import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import { EzfaService } from '../../ezfa.service';
import * as Utils from '../utils';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'ezfa-send-reset-password-link-route',
  templateUrl: './send-reset-password-link-route.component.html',
  styleUrls: ['./send-reset-password-link-route.component.scss']
})
export class SendResetPasswordLinkRouteComponent extends BaseComponent implements OnInit {

  user: firebase.User | null = null;
  fg: FormGroup;
  id: string;
  success = false;
  submitting = false;
  unhandledError: firebase.FirebaseError | null = null;
  oAuthProviderIds: string[] = [];


  constructor(
    public route: ActivatedRoute,
    public fb: FormBuilder,
    service: EzfaService
  ) {
    super(service);
  }



  ngOnInit() {
    this.service.onRouteChange('send-reset-password-link');
    this.id = _.uniqueId('ezfa-send-reset-password-link');
    this.fg = this.fb.group({
      email: ['', [Validators.required, Utils.validateEmail]]
    });
    const emailFc = this.fg.get('email') as FormControl;
    emailFc.valueChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
      Utils.clearControlErrors(emailFc, ['auth/invalid-email', 'auth/user-not-found', 'sfa/no-password']);
    });
    this.onInitLoadUser()
      .then(() => {
        let email = this.route.snapshot.queryParams.email || '';
        if (! email) {
          email = this.user ? this.user.email : '';
        }
        emailFc.setValue(email);
      });
  }

  submit() {
    this.unhandledError = null;
    this.submitting = true;
    const emailFc = this.fg.get('email') as FormControl;
    const email = _.trim(emailFc.value);
    this.ensureUserExistsWithPassword(email)
      .then(() => {
        return this.service.auth.sendPasswordResetEmail(email);
      })
      .then(() => {
        this.submitting = false;
        this.success = true;
      })
      .catch((error: firebase.FirebaseError) => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/invalid-email':
          case 'auth/user-not-found':
          case 'sfa/no-password':
            emailFc.setErrors(Utils.firebaseToFormError(error));
            break;
          default:
            this.unhandledError = error;
            break;
        }
      });
  }
  reset() {
    this.success = false;
  }

  ensureUserExistsWithPassword(email: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.oAuthProviderIds = [];
      this.service.auth.fetchProvidersForEmail(email)
        .then((providerIds: string[]) => {
          if (providerIds.length === 0) {
            return reject({code: 'auth/user-not-found'});
          }
          if (! _.includes(providerIds, 'password')) {
            this.oAuthProviderIds = _.filter(providerIds, (id) => {
              return id !== 'password';
            });
            return reject({code: 'sfa/no-password'});
          }
          return resolve();
        })
        .catch(reject);
    });
  }
}
