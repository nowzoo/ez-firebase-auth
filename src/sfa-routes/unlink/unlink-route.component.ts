import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import { SfaService } from '../../sfa/sfa.service';
import { IAuthUserEvent} from '../../sfa/sfa';
import { SfaBaseComponent } from '../sfa-base.component';
import { SfaMessages } from '../messages.enum';
@Component({
  selector: 'sfa-unlink-route',
  templateUrl: './unlink-route.component.html',
  styleUrls: ['./unlink-route.component.scss']
})
export class UnlinkRouteComponent extends SfaBaseComponent implements OnInit {

  user: firebase.User | null;
  public providerId: string | null = null;
  public screen: 'wait'|'form' = 'wait';
  public submitting = false;
  public unhandledError: firebase.FirebaseError | null = null;


  constructor(
    protected route: ActivatedRoute,
    authService: SfaService,

  ) {
    super(authService);
  }

  public ngOnInit() {
    this.onInitLoadUser()
      .then(() => {
        this.gateByUserAndProvider();
      })
  }

  public submit() {
    this.submitting = true;
    this.unhandledError = null;
    const user = this.user as firebase.User;
    user.unlink(this.providerId as string)
      .then((event: IAuthUserEvent) => {
        let message: any;
        switch (this.providerId) {
          case 'password': message = SfaMessages.passwordRemoved; break;
          case 'twitter.com': message = SfaMessages.twitterAccountRemoved; break;
          case 'facebook.com': message = SfaMessages.facebookAccountRemoved; break;
          case 'google.com': message = SfaMessages.googleAccountRemoved; break;
          case 'github.com': message = SfaMessages.githubAccountRemoved; break;
        }
        this.authService.navigate('account', {queryParams: {message:  message}});
        this.submitting = false;
      })
      .catch((error: firebase.FirebaseError) => {
        this.submitting = false;
        this.unhandledError = error;
      });
  }

  protected gateByUserAndProvider() {
    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user) => {
      this.providerId = this.route.snapshot.queryParams.providerId || null;
      if (! this.providerId) {
        this.authService.navigate();
        return;
      }
      if (! user) {
        this.authService.navigate();
        return;
      }
      const provider = _.find(user.providerData, {providerId: this.providerId}) || null;
      if (! provider) {
        this.authService.navigate();
        return;
      }
      this.screen = 'form';
    })
  }
}
