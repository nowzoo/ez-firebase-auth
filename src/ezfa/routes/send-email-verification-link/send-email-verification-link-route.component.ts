import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import { EzfaService } from '../../ezfa.service';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'ezfa-send-email-verification-link-route',
  templateUrl: './send-email-verification-link-route.component.html',
  styleUrls: ['./send-email-verification-link-route.component.scss']
})
export class SendEmailVerificationLinkRouteComponent extends BaseComponent implements OnInit {

  screen: 'form' | 'success' | 'alreadyVerified' = 'form';
  user: firebase.User;
  submitting = false;
  error: firebase.FirebaseError | null = null;

  constructor(
    service: EzfaService
  ) {
    super(service);
  }


  ngOnInit() {
    this.service.onRouteChange('send-email-verification-link');

    this.onInitLoadUser()
      .then(() => {
        if (! this.user) {
          this.service.navigate();
          return;
        }
        if (this.user.emailVerified) {
          this.screen = 'alreadyVerified';
        }
        this.gateToSignedInUser();
      });
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
        this.submitting = false;
        this.error = error;
        this.screen = 'form';
      });
  }

}
