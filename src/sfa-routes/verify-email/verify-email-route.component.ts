import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import * as firebase from 'firebase';
import { SfaService } from '../../sfa/sfa.service';
import { OUT_OF_BAND_MODES } from '../sfa-routes';

@Component({
  selector: 'sfa-verify-email-route',
  templateUrl: './verify-email-route.component.html',
  styleUrls: ['./verify-email-route.component.scss']
})
export class VerifyEmailRouteComponent implements OnInit, OnDestroy {

  public screen: 'wait'|'success'|'error' = 'wait';
  public oobCode: string;
  public email: string | null = null;
  public error: firebase.FirebaseError | null = null;
  public user: firebase.User | null = null;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected authService: SfaService,
    protected route: ActivatedRoute
  ) { }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public ngOnInit() {
    this.authService.onRoute('verify-email');
    const mode = this.route.snapshot.queryParams.mode || null;
    this.oobCode = this.route.snapshot.queryParams.oobCode || null;
    if ((mode !== OUT_OF_BAND_MODES.verifyEmail) || (! this.oobCode)) {
      this.authService.navigate();
      return;
    }

    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User) => {
      this.user = user;
    });
    this.authService.auth.checkActionCode(this.oobCode)
      .then((info: any) => {
        this.email = info.data.email;
        return this.authService.auth.applyActionCode(this.oobCode);
      })
      .then(() => {
        this.screen = 'success';
      })
      .catch((error: firebase.FirebaseError) => {
        this.error = error;
        this.screen = 'error';
      });
  }

}
