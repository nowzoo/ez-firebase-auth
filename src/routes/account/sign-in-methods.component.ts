import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import { OAuthMethod } from '../../simple-firebase-auth';
import { OauthService } from '../oauth.service'

@Component({
  selector: 'sfa-sign-in-methods',
  templateUrl: './sign-in-methods.component.html',
  styleUrls: ['./sign-in-methods.component.scss']
})
export class SignInMethodsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  user: firebase.User;
  submitting: boolean = false;
  userProviderIds: string[] = [];
  userOAuthProviderIds: string[] = [];
  userHasEmailProvider: boolean = false;
  availableOAuthProviderIds: string[] = [];
  emailProviderAvailable: boolean = false;
  removeError: firebase.FirebaseError = null;

  constructor(
    private authService: SimpleFirebaseAuthService,
    private oAuthService: OauthService
  ) { }

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit() {
    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User) => {
      this.user = user;
      if (! user) {
        this.userProviderIds = [];
        this.userOAuthProviderIds = [];
        this.userHasEmailProvider = false;
        this.availableOAuthProviderIds = [];
        this.emailProviderAvailable = false;
      } else {
        this.updateProviderIds(user);
      }
    })
  }

  protected updateProviderIds(user: firebase.User) {
    user.reload()
      .then(() => {
        this.userProviderIds = _.filter(_.map(user.providerData, 'providerId'), id => {
          return _.includes(this.authService.configuredProviderIds, id);
        });

        this.userOAuthProviderIds = _.filter(this.userProviderIds, id => {
          return id !== 'password';
        })
        this.userHasEmailProvider = _.includes(this.userProviderIds, 'password');
        this.availableOAuthProviderIds = _.filter(this.authService.oAuthProviderIds, id => {
          return !_.includes(this.userOAuthProviderIds, id)
        });
        if (this.userHasEmailProvider) {
          this.emailProviderAvailable = false;
        } else {
          this.emailProviderAvailable =  _.includes(this.authService.configuredProviderIds, 'password');
        }
      });
  }

  protected removeProvider(providerId: string) {
    this.submitting = true;
    this.removeError = null;
    this.user.unlink(providerId)
      .then(() => {
        this.updateProviderIds(this.user);
        this.submitting = false;
      })
      .catch((error: firebase.FirebaseError) => {
        this.removeError = error;
        this.submitting = false;
      })
  }

  link(providerId: string) {
    if ('password' === providerId) {
      this.authService.navigate('add-password');
      return;
    }
    switch(this.authService.oAuthMethod) {
      case OAuthMethod.popup:
        this.authService.navigate('link', {queryParams: {providerId: providerId}})
        this.oAuthService.savedPopupPromise = this.oAuthService.linkWithPopup(providerId, this.user);
        break;
      default:
        this.authService.navigate('link', {queryParams: {providerId: providerId}})
        break;
    }
  }

}
