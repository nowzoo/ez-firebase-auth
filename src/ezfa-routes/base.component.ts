import { OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';
import * as firebase from 'firebase';

import * as _ from 'lodash';
import { EzfaService } from '../ezfa/ezfa.service';
import { OauthService } from './oauth.service';
import { IAuthUserEvent,  OAuthMethod } from '../ezfa/ezfa';
import { UserProviderData } from './user-provider-data.class';


export abstract class BaseComponent implements OnDestroy {
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  user: firebase.User| null = null;
  userProviderData: UserProviderData;

  constructor(
    protected authService: EzfaService
  ) {}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  protected onInitLoadUser(): Promise<void> {
    return new Promise<void>(resolve => {
      this.authService.authState.take(1).subscribe((firstResult: firebase.User | null) => {
        this.onAuthChangedUpdate(firstResult);
        this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((subsequentResult: firebase.User | null) => {
          this.onAuthChangedUpdate(subsequentResult);
        });
        resolve();
      });
    })
  }

  protected gateToSignedInUser() {
    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User | null) => {
      if (! user) {
        this.authService.navigate();
      }
    });
  }

  protected onAuthChangedUpdate(user: firebase.User | null) {
    this.user = user;
    this.userProviderData = new UserProviderData(user, this.authService.configuredProviderIds)
  }

  protected gateToUserWithNoPassword () {

    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User | null) => {
      const password = user ?  _.find(user.providerData, {providerId: 'password'}) : null;
      if (password || (! user)) {
        return this.authService.navigate();
      }
    });
  }

  protected gateToUserWithPassword () {
    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User | null) => {
      const password = user ?  _.find(user.providerData, {providerId: 'password'}) : null;
      if (!password) {
        return this.authService.navigate();
      }
    });
  }
}
