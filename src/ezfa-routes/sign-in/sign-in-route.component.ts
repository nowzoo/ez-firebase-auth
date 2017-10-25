import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/take';
import * as _ from 'lodash';
import { EzfaService } from '../../ezfa/ezfa.service';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'ezfa-sign-in-route',
  templateUrl: './sign-in-route.component.html',
  styleUrls: ['./sign-in-route.component.scss']
})
export class SignInRouteComponent extends BaseComponent implements OnInit {
  oAuthProviderIds: string[] = [];
  isEmailConfigured = false;
  email: string | null = null;

  constructor(
    protected route: ActivatedRoute,
    authService: EzfaService,
  ) {
    super(authService);
  }

  ngOnInit() {
    this.authService.onRoute('sign-in');
    this.email = this.route.snapshot.queryParams.email || '';
    this.isEmailConfigured = _.includes(this.authService.configuredProviderIds, 'password');
    this.oAuthProviderIds = _.clone(this.authService.oAuthProviderIds);
    this.onInitLoadUser()
      .then(() => {
        if (! this.user) {
          this.authService.navigate();
        }
      })
  }
}
