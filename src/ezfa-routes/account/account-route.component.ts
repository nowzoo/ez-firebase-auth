import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import { EzfaService } from '../../ezfa/ezfa.service';
import { BaseComponent } from '../base.component';
import { OauthService } from '../oauth.service';
import { SfaMessages } from '../messages.enum';
import { OAuthMethod } from '../../ezfa/ezfa';
import { UserProviderData } from '../user-provider-data.class';

@Component({
  selector: 'ezfa-account',
  templateUrl: './account-route.component.html',
  styleUrls: ['./account-route.component.scss']
})
export class AccountRouteComponent extends BaseComponent implements OnInit, OnDestroy {

  message: number | null = null;
  user: firebase.User | null;
  userProviderData: UserProviderData;
  constructor(
    protected route: ActivatedRoute,
    protected oAuthService: OauthService,
    authService: EzfaService,
  ) {
    super(authService);
  }

  ngOnInit() {
    this.authService.onRoute('account');

    this.initMessage();
    this.onInitLoadUser()
      .then(() => {
        this.gateToSignedInUser();
      })
  }

  protected initMessage() {
    console.log(this.route)
    if (! this.route.snapshot.queryParams.message) {
      this.message = null;
      return;
    }
    const message = parseInt(this.route.snapshot.queryParams.message, 10);
    this.message = isNaN(message) ? null : message;
  }

  addProvider(providerId: string) {
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
}
