import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/take';
import * as _ from '../../lodash-funcs';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';

@Component({
  selector: 'sfa-sign-in-route',
  templateUrl: './sign-in-route.component.html',
  styleUrls: ['./sign-in-route.component.scss']
})
export class SignInRouteComponent implements OnInit {
  public oAuthProviderIds: string[] = [];
  public isEmailConfigured: boolean = false;
  public email: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: SimpleFirebaseAuthService,
  ) { }

  public ngOnInit() {
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
