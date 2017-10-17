import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import * as firebase from 'firebase';
import * as _ from '../../lodash-funcs';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import { OauthService } from '../oauth.service';
import * as Utils from '../utils';

@Component({
  selector: 'sfa-add-password-route',
  templateUrl: './add-password-route.component.html',
  styleUrls: ['./add-password-route.component.scss']
})
export class AddPasswordRouteComponent implements OnInit, OnDestroy {

  public id: string;
  public fg: FormGroup;
  public submitting: boolean = false;
  public unhandledError: firebase.FirebaseError | null = null;
  public user: firebase.User | null = null;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(
    protected fb: FormBuilder,
    protected authService: SimpleFirebaseAuthService,
    protected oAuthService: OauthService
  ) { }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

public  ngOnInit() {
    this.authService.onRouteNext('add-password');
    this.id = _.uniqueId('sfa-add-password-route');
    this.fg = this.fb.group({
      password: ['', [Validators.required]]
    });

    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User) => {
      this.user = user;
      if (! user) {
        return this.authService.navigate('sign-in');
      }
      const password = _.find(user.providerData, {providerId: 'password'});
      if (password) {
        return this.authService.navigate('account');
      }
    });
  }

  public submit() {
    this.submitting = true;
    this.unhandledError = null;
    const password = this.fg.value.email;
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
          case 'auth/provider-already-linked':
          case 'auth/invalid-credential':
          case 'auth/credential-already-in-use':
          case 'auth/email-already-in-use':
          case 'auth/operation-not-allowed':
          case 'auth/invalid-email':
          case 'auth/wrong-password':
          case 'auth/invalid-verification-code':
          case 'auth/invalid-verification-id':
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
