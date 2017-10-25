import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import * as firebase from 'firebase';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';
import { EzfaService } from '../../ezfa/ezfa.service';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'ezfa-persistence-form',
  templateUrl: './persistence-form.component.html',
  styleUrls: ['./persistence-form.component.scss']
})
export class PersistenceFormComponent extends BaseComponent implements OnInit {
  control: FormControl;
  persistenceLocal = false;
  id: string;

  constructor(
    authService: EzfaService,
  ) {
    super(authService);
  }

  ngOnInit() {
    this.id = _.uniqueId('ezfa-persistence-form');
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
