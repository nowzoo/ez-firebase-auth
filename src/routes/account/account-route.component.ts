import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import { OAuthMethod } from '../../simple-firebase-auth';
import { OauthService } from '../oauth.service'
@Component({
  selector: 'sfa-account',
  templateUrl: './account-route.component.html',
  styleUrls: ['./account-route.component.scss']
})
export class AccountRouteComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  message: string = null;
  isEmailConfigured: boolean = false;
  oAuthProviderIds: string[] = [];
  user: firebase.User | null = null;
  userHasPassword: boolean = false;
  providerIds: string[] = [];
  otherProviderIds: string[] = [];
  constructor(
    private route: ActivatedRoute,
    private authService: SimpleFirebaseAuthService,
    private oAuthService: OauthService
  ) { }

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    this.authService.onRouteNext('account');
    this.isEmailConfigured = _.includes(this.authService.configuredProviderIds, 'password');
    this.oAuthProviderIds = _.clone(this.authService.oAuthProviderIds);


    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User | null) => {
      this.user = user;
      if (! user) {
        this.authService.navigate('sign-in');
      } else {
        this.userHasPassword = _.find(user.providerData, {providerId: 'password'}) ? true : false;
        this.providerIds = _.filter(_.map(user.providerData, 'providerId'), id => {
          return _.includes(this.authService.configuredProviderIds, id)
        });
        this.otherProviderIds = _.filter(this.authService.configuredProviderIds, id => {
          return ! _.includes(this.providerIds, id);
        })
      }
    })
  }

  

}
