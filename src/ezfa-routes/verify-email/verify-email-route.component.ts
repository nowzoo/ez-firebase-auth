import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import * as firebase from 'firebase';
import { EzfaService } from '../../ezfa/ezfa.service';
import { OUT_OF_BAND_MODES } from '../routes';
import { BaseComponent } from '../base.component';
import { SfaMessages } from '../messages.enum';

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
    protected route: ActivatedRoute,
    authService: EzfaService
  ) {
  super(authService)
}


  ngOnInit() {
    this.authService.onRoute('verify-email');
    this.onInitLoadUser()
      .then(() => {
        this.checkForCode();
      })
  }

  protected checkForCode() {
    return new Promise<boolean>(resolve => {
      this.oobCode = this.route.snapshot.queryParams.oobCode || null;
      if ((this.route.snapshot.queryParams.mode !== OUT_OF_BAND_MODES.verifyEmail) || (! this.oobCode)) {
        this.authService.navigate();
        return resolve(false);
      }

      this.authService.auth.checkActionCode(this.oobCode)
        .then((info: firebase.auth.ActionCodeInfo) => {
          this.email = info['data'].email;
          return this.authService.auth.applyActionCode(this.oobCode);
        })
        .then(() => {
          this.screen = 'success';
          this.authService.navigate(null, {queryParams: {email: this.email, message: SfaMessages.emailVerified }})
          resolve(true);
        })
        .catch((error: firebase.FirebaseError) => {
          this.error = error;
          this.screen = 'error';
          resolve(true);
        });
    })

  }

}
