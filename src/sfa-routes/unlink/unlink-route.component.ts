import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import * as _ from '../../utils/lodash-funcs';
import * as firebase from 'firebase';
import { SfaService } from '../../sfa/sfa.service';
import { IAuthUserEvent} from '../../sfa/sfa';

@Component({
  selector: 'sfa-unlink-route',
  templateUrl: './unlink-route.component.html',
  styleUrls: ['./unlink-route.component.scss']
})
export class UnlinkRouteComponent implements OnInit, OnDestroy {

  public user: firebase.User | null = null;
  public providerId: string | null = null;
  public screen: 'wait'|'form' = 'wait';
  public submitting = false;
  public unhandledError: firebase.FirebaseError | null = null;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected authService: SfaService,
    protected route: ActivatedRoute,
  ) { }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public ngOnInit() {
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
      if (! provider) {
        this.authService.navigate('account');
        return;
      }
      this.screen = 'form';
    });
  }

  public submit() {
    this.submitting = true;
    this.unhandledError = null;
    const user = this.user as firebase.User;
    user.unlink(this.providerId as string)
      .then((event: IAuthUserEvent) => {
        this.authService.navigate('account');
      })
      .catch((error: firebase.FirebaseError) => {
        this.unhandledError = error;
      });
  }
}
