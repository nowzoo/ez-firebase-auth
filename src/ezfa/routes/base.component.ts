import { OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';
import * as firebase from 'firebase';

import * as _ from 'lodash';
import { EzfaService } from '../ezfa.service';
import { UserProviderData } from './user-provider-data.class';


export abstract class BaseComponent implements OnDestroy {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  user: firebase.User| null = null;
  userProviderData: UserProviderData;
  constructor(
    public service: EzfaService
  ) {}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onInitLoadUser(): Promise<void> {
    return new Promise<void>(resolve => {
      this.service.authState.take(1).subscribe((firstResult: firebase.User | null) => {
        this.onAuthChangedUpdate(firstResult);
        this.service.authState.takeUntil(this.ngUnsubscribe).subscribe((subsequentResult: firebase.User | null) => {
          this.onAuthChangedUpdate(subsequentResult);
        });
        resolve();
      });
    });
  }

  gateToSignedInUser() {
    this.service.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User | null) => {
      if (! user) {
        this.service.navigate();
      }
    });
  }

  onAuthChangedUpdate(user: firebase.User | null) {
    this.user = user;
    this.userProviderData = new UserProviderData(user, this.service.providerIds);
  }

  gateToUserWithNoPassword () {

    this.service.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User | null) => {
      const password = user ?  _.find(user.providerData, {providerId: 'password'}) : null;
      if (password || (! user)) {
        return this.service.navigate();
      }
    });
  }

  gateToUserWithPassword () {
    this.service.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User | null) => {
      const password = user ?  _.find(user.providerData, {providerId: 'password'}) : null;
      if (!password) {
        return this.service.navigate();
      }
    });
  }

}
