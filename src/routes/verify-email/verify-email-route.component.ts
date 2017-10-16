import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import * as firebase from 'firebase';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import { OUT_OF_BAND_MODES } from '../simple-firebase-auth-routes';

@Component({
  selector: 'sfa-verify-email-route',
  templateUrl: './verify-email-route.component.html',
  styleUrls: ['./verify-email-route.component.scss']
})
export class VerifyEmailRouteComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  screen: 'wait'|'success'|'error' = 'wait';
  oobCode: string;
  email: string = null;
  error: firebase.FirebaseError = null;
  user: firebase.User = null;
  constructor(
    private authService: SimpleFirebaseAuthService,
    private route: ActivatedRoute
  ) { }

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    this.authService.onRouteNext('verify-email');
    const mode = this.route.snapshot.queryParams.mode || null;
    this.oobCode = this.route.snapshot.queryParams.oobCode || null;
    if ((mode !== OUT_OF_BAND_MODES.verifyEmail) || (! this.oobCode)) {
      this.authService.navigate();
      return;
    }

    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User) => {
      this.user = user;
    })
    this.authService.auth.checkActionCode(this.oobCode)
      .then((info: firebase.auth.ActionCodeInfo) => {
        this.email = info['data']['email'];
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
