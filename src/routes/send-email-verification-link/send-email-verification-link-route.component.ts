import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';

@Component({
  selector: 'sfa-send-email-verification-link-route',
  templateUrl: './send-email-verification-link-route.component.html',
  styleUrls: ['./send-email-verification-link-route.component.scss']
})
export class SendEmailVerificationLinkRouteComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  screen:  'form' | 'success' | 'alreadyVerified' = 'form';
  user: firebase.User;
  submitting: boolean = false;
  error: firebase.FirebaseError = null;
  constructor(
    protected authService: SimpleFirebaseAuthService
  ) { }

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit() {
    this.authService.onRouteNext('send-email-verification-link');
    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User) => {
      this.user = user;
      if (! this.user){
        this.authService.navigate('sign-in');
      }
      if (this.user.emailVerified) {
        this.screen = 'alreadyVerified';
      }
    })
  }

  submit() {
    this.submitting = true;
    this.error = null;
    this.user.sendEmailVerification()
      .then(() => {
        this.submitting = false;
        this.screen = 'success';
      })
      .catch((error: firebase.FirebaseError) => {
        this.error = error;
        this.screen = 'form';
      })
  }
  reset() {

  }

}
