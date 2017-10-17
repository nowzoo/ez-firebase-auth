import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import * as _ from '../../lodash-funcs';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import { OAuthMethod } from '../../simple-firebase-auth';
import { OauthService } from '../oauth.service';

@Component({
  selector: 'sfa-sign-in-methods',
  templateUrl: './sign-in-methods.component.html',
  styleUrls: ['./sign-in-methods.component.scss']
})
export class SignInMethodsComponent implements OnInit, OnDestroy {

  public user: firebase.User;
  public submitting: boolean = false;
  public userProviderIds: string[] = [];
  public userOAuthProviderIds: string[] = [];
  public userHasEmailProvider: boolean = false;
  public availableOAuthProviderIds: string[] = [];
  public emailProviderAvailable: boolean = false;
  public removeError: firebase.FirebaseError | null = null;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected authService: SimpleFirebaseAuthService,
    protected oAuthService: OauthService
  ) { }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  public ngOnInit() {
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
    });
  }
  public link(providerId: string) {
    if ('password' === providerId) {
      this.authService.navigate('add-password');
      return;
    }
    switch (this.authService.oAuthMethod) {
      case OAuthMethod.popup:
        this.authService.navigate('link', {queryParams: {providerId: providerId}});
        this.oAuthService.savedPopupPromise = this.oAuthService.linkWithPopup(providerId, this.user);
        break;
      default:
        this.authService.navigate('link', {queryParams: {providerId: providerId}});
        break;
    }
  }

  protected updateProviderIds(user: firebase.User) {
    user.reload()
      .then(() => {
        this.userProviderIds = _.filter(_.map(user.providerData, 'providerId'), (id) => {
          return _.includes(this.authService.configuredProviderIds, id);
        }) as string[];

        this.userOAuthProviderIds = _.filter(this.userProviderIds, (id) => {
          return id !== 'password';
        });
        this.userHasEmailProvider = _.includes(this.userProviderIds, 'password');
        this.availableOAuthProviderIds = _.filter(this.authService.oAuthProviderIds, (id) => {
          return !_.includes(this.userOAuthProviderIds, id);
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
      });
  }
}
