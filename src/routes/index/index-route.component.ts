import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/operator/take';
import * as _ from '../../lodash-funcs';

import { OUT_OF_BAND_MODES } from '../simple-firebase-auth-routes';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
@Component({
  selector: 'sfa-index-route',
  templateUrl: './index-route.component.html',
  styleUrls: ['./index-route.component.scss']
})
export class IndexRouteComponent implements OnInit {

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected authService: SimpleFirebaseAuthService
  ) { }

  public ngOnInit() {
    const oobCode = this.route.snapshot.queryParams.oobCode || null;
    const mode = this.route.snapshot.queryParams.mode || null;
    if ((! mode) || (! _.has(OUT_OF_BAND_MODES, mode)) || (! oobCode)) {
      this.authService.authState.take(1).subscribe((user) => {
        if (! user) {
          return this.router.navigate(['sign-in'], {relativeTo: this.route});
        } else {
          return this.authService.navigate('account');
        }
      });
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
