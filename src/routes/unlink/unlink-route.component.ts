import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
import { AuthUserEvent} from '../../simple-firebase-auth';

@Component({
  selector: 'sfa-unlink-route',
  templateUrl: './unlink-route.component.html',
  styleUrls: ['./unlink-route.component.scss']
})
export class UnlinkRouteComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  user: firebase.User = null;
  providerId: string = null;
  screen: 'wait'|'form' = 'wait';
  submitting: boolean = false;
  unhandledError: firebase.FirebaseError = null;

  constructor(
    private authService: SimpleFirebaseAuthService,
    private route: ActivatedRoute,
  ) { }

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    this.providerId = this.route.snapshot.queryParams.providerId || null;

    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User) => {
      this.user = user;
      if (! user) {
        this.authService.navigate('sign-in');
        return;
      }
      if (! this.providerId) {
        this.authService.navigate('account');
        return;
      }
      const provider = _.find(user.providerData, {providerId: this.providerId}) || null;
      if (! provider){
        this.authService.navigate('account');
        return;
      }
      this.screen = 'form';
    })
  }

  submit() {
    this.submitting = true;
    this.unhandledError = null;
    this.user.unlink(this.providerId)
      .then((event: AuthUserEvent) => {
        this.authService.navigate('account');
      })
      .catch((error: firebase.FirebaseError) => {
        this.unhandledError = error;
      })
  }

}
