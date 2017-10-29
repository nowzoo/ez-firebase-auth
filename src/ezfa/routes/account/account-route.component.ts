import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import { EzfaService } from '../../ezfa.service';
import { BaseComponent } from '../base.component';
import { Messages } from '../messages.enum';
import { EzfaOauthMethod } from '../../ezfa-oauth-method.enum';
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
    public route: ActivatedRoute,
    service: EzfaService,
  ) {
    super(service);
  }

  ngOnInit() {
    this.service.onRouteChange('account');
    this.initMessage();
    this.onInitLoadUser()
      .then(() => {
        this.gateToSignedInUser();
      });
  }

  initMessage() {
    if (! this.route.snapshot.queryParams.message) {
      this.message = null;
      return;
    }
    const message = parseInt(this.route.snapshot.queryParams.message, 10);
    this.message = isNaN(message) ? null : message;
  }

  addProvider(providerId: string) {
    if ('password' === providerId) {
      this.service.navigate('add-password');
      return;
    }
    this.service.navigate('link', {queryParams: {providerId: providerId}});
    if (EzfaOauthMethod.popup === this.service.oauthMethod) {
      this.service.savedPopupPromise = this.service.getProviderById(providerId)
        .then(provider => {
          return this.user.linkWithPopup(provider);
        });
    }
  }
}
