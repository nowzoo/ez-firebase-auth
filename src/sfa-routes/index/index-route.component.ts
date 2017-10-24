import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/take';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import { OUT_OF_BAND_MODES } from '../sfa-routes';
import { SfaService } from '../../sfa/sfa.service';
import { SfaMessages } from '../messages.enum';
import { SfaBaseComponent } from '../sfa-base.component';

@Component({
  selector: 'sfa-index-route',
  templateUrl: './index-route.component.html',
  styleUrls: ['./index-route.component.scss']
})
export class IndexRouteComponent extends SfaBaseComponent implements OnInit {

  constructor(
    protected route: ActivatedRoute,
    authService: SfaService
  ) {
    super(authService);
  }

  public ngOnInit() {
    const oobCode = this.route.snapshot.queryParams.oobCode || null;
    const mode = this.route.snapshot.queryParams.mode || null;
    if ((! mode) || (! _.has(OUT_OF_BAND_MODES, mode)) || (! oobCode)) {
      this.authService.authState.take(1).subscribe((user: firebase.User | null) => {
        if (! user) {
          return this.authService.navigate('sign-in');
        } else {
          return this.authService.navigate('account');
        }
      });
      return;
    }
    switch (mode) {
      case OUT_OF_BAND_MODES.recoverEmail:
        return this.authService.navigate('recover-email', {queryParamsHandling: 'preserve'});
      case OUT_OF_BAND_MODES.resetPassword:
        return this.authService.navigate('reset-password', {queryParamsHandling: 'preserve'});
      case OUT_OF_BAND_MODES.verifyEmail:
        return this.authService.navigate('verify-email', {queryParamsHandling: 'preserve'});
    }
  }
}
