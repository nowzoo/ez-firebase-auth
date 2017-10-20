import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import { SfaService } from '../../sfa/sfa.service';
@Component({
  selector: 'sfa-account',
  templateUrl: './account-route.component.html',
  styleUrls: ['./account-route.component.scss']
})
export class AccountRouteComponent implements OnInit, OnDestroy {

  public message: string|null = null;
  public user: firebase.User | null = null;
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected route: ActivatedRoute,
    protected authService: SfaService,
  ) { }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public ngOnInit() {
    this.authService.onRoute('account');
    this.message = this.route.snapshot.queryParams.message || null;
    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user: firebase.User | null) => {
      this.user = user;
      if (! user) {
        this.authService.navigate('sign-in');
      }
    });
  }
}
