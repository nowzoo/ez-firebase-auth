import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import { EzfaService } from '../../ezfa.service';
import { EzfaProviderUnlinkedEvent} from '../../ezfa-provider-unlinked-event.class';
import { BaseComponent } from '../base.component';
import { Messages } from '../messages.enum';
@Component({
  selector: 'ezfa-unlink-route',
  templateUrl: './unlink-route.component.html',
  styleUrls: ['./unlink-route.component.scss']
})
export class UnlinkRouteComponent extends BaseComponent implements OnInit {

  user: firebase.User | null;
  providerId: string | null = null;
  screen: 'wait'|'form' = 'wait';
  submitting = false;
  unhandledError: firebase.FirebaseError | null = null;


  constructor(
    public route: ActivatedRoute,
    service: EzfaService,

  ) {
    super(service);
  }

  ngOnInit() {
    this.onInitLoadUser()
      .then(() => {
        this.gateByUserAndProvider();
      });
  }

  submit() {
    this.submitting = true;
    this.unhandledError = null;
    this.user.unlink(this.providerId as string)
      .then((user: firebase.User) => {
        const event = new EzfaProviderUnlinkedEvent(user, this.providerId);
        let message: any;
        switch (this.providerId) {
          case 'password': message = Messages.passwordRemoved; break;
          case 'twitter.com': message = Messages.twitterAccountRemoved; break;
          case 'facebook.com': message = Messages.facebookAccountRemoved; break;
          case 'google.com': message = Messages.googleAccountRemoved; break;
          case 'github.com': message = Messages.githubAccountRemoved; break;
        }
        this.service.onProviderUnlinked(event);
        this.service.navigate('account', {queryParams: {message:  message}});
        this.submitting = false;
      })
      .catch((error: firebase.FirebaseError) => {
        this.submitting = false;
        this.unhandledError = error;
      });
  }

  gateByUserAndProvider() {
    this.service.authState.takeUntil(this.ngUnsubscribe).subscribe((user) => {
      this.providerId = this.route.snapshot.queryParams.providerId || null;
      if (! this.providerId) {
        this.service.navigate();
        return;
      }
      if (! user) {
        this.service.navigate();
        return;
      }
      const provider = _.find(user.providerData, {providerId: this.providerId}) || null;
      if (! provider) {
        this.service.navigate();
        return;
      }
      this.screen = 'form';
    });
  }
}
