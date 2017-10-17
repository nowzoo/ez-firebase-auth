import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import * as _ from '../../lodash-funcs';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import { OAuthMethod } from '../../simple-firebase-auth';
import { OauthService } from '../oauth.service';
@Component({
  selector: 'sfa-account',
  templateUrl: './account-route.component.html',
  styleUrls: ['./account-route.component.scss']
})
export class AccountRouteComponent implements OnInit, OnDestroy {

  public message: string|null = null;
  public isEmailConfigured: boolean = false;
  public oAuthProviderIds: string[] = [];
  public user: firebase.User | null = null;
  public userHasPassword: boolean = false;
  public providerIds: string[] = [];
  public otherProviderIds: string[] = [];

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected route: ActivatedRoute,
    protected authService: SimpleFirebaseAuthService,
    protected oAuthService: OauthService
  ) { }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public ngOnInit() {
    this.authService.onRouteNext('account');
    this.isEmailConfigured = _.includes(this.authService.configuredProviderIds, 'password');
    this.oAuthProviderIds = _.clone(this.authService.oAuthProviderIds);
    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User | null) => {
      this.user = user;
      if (! user) {
        this.authService.navigate('sign-in');
      } else {
        this.userHasPassword = _.find(user.providerData, {providerId: 'password'}) ? true : false;
        this.providerIds = (_.filter(_.map(user.providerData, 'providerId'), (id) => {
          return _.includes(this.authService.configuredProviderIds, id);
        })) as string[];
        this.otherProviderIds = _.filter(this.authService.configuredProviderIds, (id) => {
          return ! _.includes(this.providerIds, id);
        });
      }
    });
  }
}
