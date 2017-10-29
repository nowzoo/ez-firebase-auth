import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import * as firebase from 'firebase';
import { EzfaService } from '../../ezfa.service';
import { BaseComponent } from '../base.component';
import { Messages } from '../messages.enum';

@Component({
  selector: 'ezfa-verify-email-route',
  templateUrl: './verify-email-route.component.html',
  styleUrls: ['./verify-email-route.component.scss']
})
export class VerifyEmailRouteComponent extends BaseComponent implements OnInit, OnDestroy {

  screen: 'wait'|'success'|'error' = 'wait';
  oobCode: string;
  email: string | null = null;
  error: firebase.FirebaseError | null = null;
  user: firebase.User | null = null;


  constructor(
    public route: ActivatedRoute,
    service: EzfaService
  ) {
   super(service);
  }


  ngOnInit() {
    this.service.onRouteChange('verify-email');
    this.onInitLoadUser()
      .then(() => {
        this.checkCode();
      });
  }

  checkCode() {
    return new Promise<boolean>(resolve => {
      this.oobCode = this.route.snapshot.queryParams.oobCode || null;
      if ((this.route.snapshot.queryParams.mode !== EzfaService.OUT_OF_BAND_MODES.verifyEmail) || (! this.oobCode)) {
        this.service.navigate();
        return resolve(false);
      }

      this.service.auth.checkActionCode(this.oobCode)
        .then((info: firebase.auth.ActionCodeInfo) => {
          this.email = info['data'].email;
          return this.service.auth.applyActionCode(this.oobCode);
        })
        .then(() => {
          this.screen = 'success';
          this.service.navigate(null, {queryParams: {email: this.email, message: Messages.emailVerified }});
          resolve(true);
        })
        .catch((error: firebase.FirebaseError) => {
          this.error = error;
          this.screen = 'error';
          resolve(true);
        });
    });

  }
}
