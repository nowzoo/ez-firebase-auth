import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/take';
import * as firebase from 'firebase';
import * as _ from '../../utils/lodash-funcs';
import { SfaService } from '../../sfa/sfa.service';
import * as Utils from '../../utils/utils';

@Component({
  selector: 'sfa-send-reset-password-link-route',
  templateUrl: './send-reset-password-link-route.component.html',
  styleUrls: ['./send-reset-password-link-route.component.scss']
})
export class SendResetPasswordLinkRouteComponent implements OnInit, OnDestroy {

  public user: firebase.User | null = null;
  public fg: FormGroup;
  public id: string;
  public success = false;
  public submitting = false;
  public unhandledError: firebase.FirebaseError | null = null;
  public oAuthProviderIds: string[] = [];

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected route: ActivatedRoute,
    protected fb: FormBuilder,
    protected authService: SfaService
  ) { }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public ngOnInit() {
    this.authService.onRoute('send-reset-password-link');
    this.id = _.uniqueId('sfa-send-reset-password-link');
    this.fg = this.fb.group({
      email: ['', [Validators.required, Utils.validateEmail]]
    });
    const emailFc = this.fg.get('email') as FormControl;
    this.authService.authState.take(1).subscribe((user: firebase.User) => {
      let email = this.route.snapshot.queryParams.email || '';
      if (! email) {
        email = user ? user.email : '';
      }
      emailFc.setValue(email);
      emailFc.valueChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
        Utils.clearControlErrors(emailFc, ['auth/invalid-email', 'auth/user-not-found']);
      });
    });
  }

  public submit() {
    this.unhandledError = null;
    this.submitting = true;
    const emailFc = this.fg.get('email') as FormControl;
    const email = _.trim(emailFc.value);
    this.authService.auth.fetchProvidersForEmail(email)
      .then((providerIds: string[]) => {
        return new Promise((resolve, reject) => {
          if (providerIds.length === 0) {
            return reject({code: 'auth/user-not-found'});
          }
          if (! _.includes(providerIds, 'password')) {
            this.oAuthProviderIds = _.filter(providerIds, (id) => {
              return id !== 'password';
            });
            return reject({code: 'no-password'});
          }
          return resolve();
        });
      })
      .then(() => {
        return this.authService.auth.sendPasswordResetEmail(email);
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
          case 'no-password':
            emailFc.setErrors(Utils.firebaseToFormError(error));
            break;
          default:
            this.unhandledError = error;
            break;
        }
      });
  }
  public reset() {
    this.success = false;
  }
}
