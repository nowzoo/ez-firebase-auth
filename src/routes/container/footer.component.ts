import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as firebase from 'firebase';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
@Component({
  selector: 'sfa-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {

  public user: firebase.User | null = null;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private authService: SimpleFirebaseAuthService
  ) { }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public ngOnInit() {
    this.authService.authState.takeUntil(this.ngUnsubscribe).subscribe((user) => {
      this.user = user;
    });
  }
}
