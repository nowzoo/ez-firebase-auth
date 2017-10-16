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
export class RecoverEmailRouteComponent implements OnInit {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  screen: 'wait'|'success'|'form'|'error' = 'wait';
  oobCode: string;
  fromEmail: string = null;
  email: string = null;
  error: firebase.FirebaseError = null;
  user: firebase.User = null;
  submitting: boolean = false;
  constructor(
    private authService: SimpleFirebaseAuthService,
    private route: ActivatedRoute
  ) { }

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    this.authService.onRouteNext('recover-email');
    const mode = this.route.snapshot.queryParams.mode || null;
    this.oobCode = this.route.snapshot.queryParams.oobCode || null;
    if ((mode !== OUT_OF_BAND_MODES.recoverEmail) || (! this.oobCode)) {
      this.authService.navigate();
      return;
    }

    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User) => {
      this.user = user;
    })
    this.authService.auth.checkActionCode(this.oobCode)
      .then((info: firebase.auth.ActionCodeInfo) => {
        this.fromEmail = info['data']['fromEmail'];
        this.email = info['data']['email'];
        this.screen = 'form';
      })
      .catch((error: firebase.FirebaseError) => {
        this.error = error;
        this.screen = 'error';
      });
  }
  submit() {
    this.submitting = true;
    this.authService.auth.applyActionCode(this.oobCode)
      .then(() => {
        this.screen = 'success';
      });
  }
}
