import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/take';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import { EzfaService } from '../../ezfa.service';
import { Messages } from '../messages.enum';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'ezfa-index-route',
  templateUrl: './index-route.component.html',
  styleUrls: ['./index-route.component.scss']
})
export class IndexRouteComponent extends BaseComponent implements OnInit {

  constructor(
    public route: ActivatedRoute,
    service: EzfaService
  ) {
    super(service);
  }

  public ngOnInit() {
    const oobCode = this.route.snapshot.queryParams.oobCode || null;
    const mode = this.route.snapshot.queryParams.mode || null;
    if ((! mode) || (! _.has(EzfaService.OUT_OF_BAND_MODES, mode)) || (! oobCode)) {
      this.service.authState.take(1).subscribe((user: firebase.User | null) => {
        if (! user) {
          return this.service.navigate('sign-in');
        } else {
          return this.service.navigate('account');
        }
      });
      return;
    }
    switch (mode) {
      case EzfaService.OUT_OF_BAND_MODES.recoverEmail:
        return this.service.navigate('recover-email', {queryParamsHandling: 'preserve'});
      case EzfaService.OUT_OF_BAND_MODES.resetPassword:
        return this.service.navigate('reset-password', {queryParamsHandling: 'preserve'});
      case EzfaService.OUT_OF_BAND_MODES.verifyEmail:
        return this.service.navigate('verify-email', {queryParamsHandling: 'preserve'});
    }
  }
}
