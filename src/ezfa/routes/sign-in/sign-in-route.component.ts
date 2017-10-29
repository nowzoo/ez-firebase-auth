import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import 'rxjs/add/operator/take';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import { EzfaService } from '../../ezfa.service';
import { EzfaSignedInEvent } from '../../ezfa-signed-in-event.class';
import { EzfaOauthMethod } from '../../ezfa-oauth-method.enum';
import { BaseComponent } from '../base.component';
import { Messages } from '../messages.enum';

@Component({
  selector: 'ezfa-sign-in-route',
  templateUrl: './sign-in-route.component.html',
  styleUrls: ['./sign-in-route.component.scss']
})
export class SignInRouteComponent extends BaseComponent implements OnInit {

  email: string | null = null;
  constructor(
    protected route: ActivatedRoute,
    service: EzfaService,
  ) {
    super(service);
  }

  ngOnInit() {
    this.service.onRouteChange('sign-in');
    this.email = this.route.snapshot.queryParams.email || '';
    this.onInitLoadUser()
      .then(() => {
        if (this.user) {
          this.service.navigate();
        }
      });
  }
}
