import { Component, OnInit } from '@angular/core';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
@Component({
  selector: 'sfa-sign-out-route',
  templateUrl: './sign-out-route.component.html',
  styleUrls: ['./sign-out-route.component.scss']
})
export class SignOutRouteComponent implements OnInit {

  screen: 'wait'|'success' = 'wait';
  constructor(
    protected authService: SimpleFirebaseAuthService
  ) { }

  ngOnInit() {
    this.authService.onRouteNext('sign-out');
    this.authService.auth.signOut()
      .then(() => {
        this.screen = 'success';
        this.authService.onSignedOutNext();
      });
  }

}
