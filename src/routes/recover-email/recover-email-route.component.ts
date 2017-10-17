import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import * as firebase from 'firebase';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import { OUT_OF_BAND_MODES } from '../simple-firebase-auth-routes';

@Component({
  selector: 'sfa-recover-email-route',
  templateUrl: './recover-email-route.component.html',
  styleUrls: ['./recover-email-route.component.scss']
})
export class RecoverEmailRouteComponent implements OnInit, OnDestroy {

  public screen: 'wait'|'success'|'form'|'error' = 'wait';
  public oobCode: string;
  public error: firebase.FirebaseError | null = null;
  public user: firebase.User | null = null;
  public submitting: boolean = false;
  public actionCodeInfo: firebase.auth.ActionCodeInfo | null = null;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected authService: SimpleFirebaseAuthService,
    protected route: ActivatedRoute
  ) { }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public ngOnInit() {
    this.authService.onRouteNext('recover-email');
    const mode = this.route.snapshot.queryParams.mode || null;
    this.oobCode = this.route.snapshot.queryParams.oobCode || null;
    if ((mode !== OUT_OF_BAND_MODES.recoverEmail) || (! this.oobCode)) {
      this.authService.navigate();
      return;
    }

    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User) => {
      this.user = user;
    });
    this.authService.auth.checkActionCode(this.oobCode)
      .then((info: firebase.auth.ActionCodeInfo) => {
        this.actionCodeInfo = info;
        this.screen = 'form';
      })
      .catch((error: firebase.FirebaseError) => {
        this.error = error;
        this.screen = 'error';
      });
  }
  public submit() {
    this.submitting = true;
    this.authService.auth.applyActionCode(this.oobCode)
      .then(() => {
        this.screen = 'success';
      });
  }
}
