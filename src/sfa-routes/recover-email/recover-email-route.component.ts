import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import * as firebase from 'firebase';
import { SfaService } from '../../sfa/sfa.service';
import { OUT_OF_BAND_MODES } from '../sfa-routes';
import { SfaBaseComponent } from '../sfa-base.component';

@Component({
  selector: 'sfa-recover-email-route',
  templateUrl: './recover-email-route.component.html',
  styleUrls: ['./recover-email-route.component.scss']
})
export class RecoverEmailRouteComponent extends SfaBaseComponent  implements OnInit {
  public screen: 'wait'|'success'|'form'|'error' = 'wait';
  public oobCode: string;
  public error: firebase.FirebaseError | null = null;
  public user: firebase.User | null = null;
  public submitting = false;
  public actionCodeInfo: firebase.auth.ActionCodeInfo | null = null;


  constructor(
    protected route: ActivatedRoute,
    authService: SfaService,
  ) {
    super(authService);
  }

  public ngOnInit() {
    this.authService.onRoute('recover-email');
    this.onInitLoadUser()
      .then(() => {
        this.checkForCode()
      })
  }
  submit() {
    this.submitting = true;
    this.authService.auth.applyActionCode(this.oobCode)
      .then(() => {
        this.screen = 'success';
        this.submitting = false;
      })
      .catch((error: firebase.FirebaseError) => {
        this.error = error;
        this.screen = 'error';
      })
  }

  protected checkForCode() {
    return new Promise<boolean>(resolve => {
      this.oobCode = this.route.snapshot.queryParams.oobCode || null;
      if ((this.route.snapshot.queryParams.mode !== OUT_OF_BAND_MODES.recoverEmail) || (! this.oobCode)) {
        this.authService.navigate();
        return resolve(false);
      }

      this.authService.auth.checkActionCode(this.oobCode)
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
    })

  }
}
