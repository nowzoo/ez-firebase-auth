import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import * as _ from '../../utils/lodash-funcs';
import { SfaService } from '../../sfa/sfa.service';
import { OAuthMethod } from '../../sfa/sfa';
import { OauthService } from '../oauth.service';

@Component({
  selector: 'sfa-sign-in-methods',
  templateUrl: './sign-in-methods.component.html',
  styleUrls: ['./sign-in-methods.component.scss']
})
export class SignInMethodsComponent implements OnInit, OnDestroy {

  public user: firebase.User;
  public submitting = false;
  public userProviderIds: string[] = [];
  public userOAuthProviderIds: string[] = [];
  public userHasEmailProvider = false;
  public availableOAuthProviderIds: string[] = [];
  public emailProviderAvailable = false;
  public removeError: firebase.FirebaseError | null = null;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected authService: SfaService,
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
        this.updateProviderIds(user, this.authService.configuredProviderIds, this.authService.oAuthProviderIds);
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

  protected updateProviderIds(user: firebase.User, configuredIds: string[], configuredOAuthIds: string[]) {
    user.reload()
      .then(() => {
        this.userProviderIds = _.filter(_.map(user.providerData, 'providerId'), (id) => {
          return _.includes(configuredIds, id);
        }) as string[];

        this.userOAuthProviderIds = _.filter(this.userProviderIds, (id) => {
          return id !== 'password';
        });
        this.userHasEmailProvider = _.includes(this.userProviderIds, 'password');
        this.availableOAuthProviderIds = _.filter(configuredOAuthIds, (id) => {
          return !_.includes(this.userOAuthProviderIds, id);
        });
        if (this.userHasEmailProvider) {
          this.emailProviderAvailable = false;
        } else {
          this.emailProviderAvailable =  _.includes(configuredIds, 'password');
        }
      });
  }
}
