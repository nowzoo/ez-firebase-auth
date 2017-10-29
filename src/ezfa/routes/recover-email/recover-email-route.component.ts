import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import * as firebase from 'firebase';
import { EzfaService } from '../../ezfa.service';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'ezfa-recover-email-route',
  templateUrl: './recover-email-route.component.html',
  styleUrls: ['./recover-email-route.component.scss']
})
export class RecoverEmailRouteComponent extends BaseComponent  implements OnInit {
  screen: 'wait'|'success'|'form'|'error' = 'wait';
  oobCode: string;
  error: firebase.FirebaseError | null = null;
  user: firebase.User | null = null;
  submitting = false;
  actionCodeInfo: firebase.auth.ActionCodeInfo | null = null;


  constructor(
    public route: ActivatedRoute,
    service: EzfaService,
  ) {
    super(service);
  }

  ngOnInit() {
    this.service.onRouteChange('recover-email');
    this.onInitLoadUser()
      .then(() => {
        this.checkCode();
      });
  }
  submit() {
    this.submitting = true;
    this.service.auth.applyActionCode(this.oobCode)
      .then(() => {
        this.screen = 'success';
        this.submitting = false;
      })
      .catch((error: firebase.FirebaseError) => {
        this.error = error;
        this.screen = 'error';
      });
  }

  checkCode() {
    return new Promise<boolean>(resolve => {
      this.oobCode = this.route.snapshot.queryParams.oobCode || null;
      if ((this.route.snapshot.queryParams.mode !== EzfaService.OUT_OF_BAND_MODES.recoverEmail) || (! this.oobCode)) {
        this.service.navigate();
        return resolve(false);
      }

      this.service.auth.checkActionCode(this.oobCode)
        .then((info: firebase.auth.ActionCodeInfo) => {
          this.actionCodeInfo = info;
          this.screen = 'form';
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
