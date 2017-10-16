import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/take';
import * as _ from 'lodash';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';

@Component({
  selector: 'sfa-sign-in-route',
  templateUrl: './sign-in-route.component.html',
  styleUrls: ['./sign-in-route.component.scss']
})
export class SignInRouteComponent implements OnInit {
  oAuthProviderIds: string[] = [];
  isEmailConfigured: boolean = false;
  email: string = null;


  constructor(
    private route: ActivatedRoute,
    private authService: SimpleFirebaseAuthService,
  ) { }

  ngOnInit() {
    this.authService.onRouteNext('sign-in');
    this.email = this.route.snapshot.queryParams.email || '';
    this.isEmailConfigured = _.includes(this.authService.configuredProviderIds, 'password');
    this.oAuthProviderIds = _.clone(this.authService.oAuthProviderIds);
    this.authService.authState.take(1).subscribe((user) => {
      if (user) {
        return this.authService.navigate('account');
      }
    });
  }
}
