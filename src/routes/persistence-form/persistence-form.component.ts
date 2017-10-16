import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
@Component({
  selector: 'sfa-persistence-form',
  templateUrl: './persistence-form.component.html',
  styleUrls: ['./persistence-form.component.scss']
})
export class PersistenceFormComponent  implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  control: FormControl;
  persistenceLocal: boolean = false;
  constructor(
    private authService: SimpleFirebaseAuthService,
  ) {}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    this.control = new FormControl(false);
    this.authService.persistenceLocal.takeUntil(this.ngUnsubscribe).subscribe((b: boolean) => {
      this.persistenceLocal = b;
      this.control.setValue(b, {emitEvent: false});
    });
    this.control.valueChanges.subscribe(b => {
      this.authService.setPersistenceLocal(b);
    })

  }
}
