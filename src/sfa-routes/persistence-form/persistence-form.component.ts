import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import * as firebase from 'firebase';
import 'rxjs/add/operator/takeUntil';
import * as _ from '../../utils/lodash-funcs';
import { SfaService } from '../../sfa/sfa.service';
import { SfaBaseComponent } from '../sfa-base.component';

@Component({
  selector: 'sfa-persistence-form',
  templateUrl: './persistence-form.component.html',
  styleUrls: ['./persistence-form.component.scss']
})
export class PersistenceFormComponent extends SfaBaseComponent implements OnInit {
  control: FormControl;
  persistenceLocal = false;
  id: string;

  constructor(
    authService: SfaService,
  ) {
    super(authService);
  }

  ngOnInit() {
    this.id = _.uniqueId('sfa-persistence-form');
    this.control = new FormControl(false);
    this.authService.persistenceLocal.takeUntil(this.ngUnsubscribe).subscribe((b: boolean) => {
      this.persistenceLocal = b;
      this.control.setValue(b, {emitEvent: false});
    });
    this.control.valueChanges.subscribe((b) => {
      this.authService.setPersistenceLocal(b);
    });
  }
}
