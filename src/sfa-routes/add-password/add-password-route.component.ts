import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import * as firebase from 'firebase';
import 'rxjs/add/operator/takeUntil';
import { SfaBaseComponent } from '../sfa-base.component';
import { SfaService } from '../../sfa/sfa.service';
import * as Utils from '../../utils/utils';
import * as _ from 'lodash';

@Component({
  selector: 'sfa-add-password-route',
  templateUrl: './add-password-route.component.html',
  styleUrls: ['./add-password-route.component.scss']
})
export class AddPasswordRouteComponent extends SfaBaseComponent implements OnInit {

  id: string;
  fg: FormGroup;
  submitting = false;
  unhandledError: firebase.FirebaseError | null = null;
  user: firebase.User | null;

  constructor(
    protected fb: FormBuilder,
    authService: SfaService,
  ) {
    super(authService);
  }



ngOnInit() {
    this.authService.onRoute('add-password');
    this.id = _.uniqueId('sfa-add-password-route');
    this.fg = this.fb.group({
      password: ['', [Validators.required]]
    });
    this.fg.get('password').valueChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
      Utils.clearControlErrors(this.fg.get('password'), ['auth/weak-password']);
    })
    this.onInitLoadUser()
      .then(() => {
        this.gateToUserWithNoPassword();
      })
  }

  submit() {
    this.submitting = true;
    this.unhandledError = null;
    const password = this.fg.value.password;
    this.addPassword(this.user as firebase.User, password)
      .then((result: firebase.User) => {
        this.user = result;
        this.submitting = false;
        this.authService.navigate('account');
      })
      .catch((error: firebase.FirebaseError) => {
        switch (error.code) {

          case 'auth/weak-password':
            (this.fg.get('password') as FormControl).setErrors(Utils.firebaseToFormError(error));
            break;
          case 'auth/requires-recent-login':
            this.authService.navigate('reauthenticate', {queryParams: {redirect: 'add-password'}});
            break;
          default:
            this.unhandledError = error;
            break;
        }
        this.submitting = false;
      });
  }

  protected addPassword(user: firebase.User, password: string): Promise<firebase.User> {
    return new Promise((resolve, reject) => {
      this.authService.getProviderById('password')
        .then((provider: firebase.auth.EmailAuthProvider) => {
          const credential = firebase.auth.EmailAuthProvider.credential(user.email as string, password);
          return user.linkWithCredential(credential);
        })
        .then(resolve)
        .catch(reject);
    });
  }

}
