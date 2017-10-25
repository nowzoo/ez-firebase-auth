import { Component, OnInit } from '@angular/core';
import { EzfaService } from '../../ezfa/ezfa.service';
@Component({
  selector: 'ezfa-sign-out-route',
  templateUrl: './sign-out-route.component.html',
  styleUrls: ['./sign-out-route.component.scss']
})
export class SignOutRouteComponent implements OnInit {

  public screen: 'wait'|'success' = 'wait';
  constructor(
    protected authService: EzfaService
  ) { }

  public ngOnInit() {
    this.authService.onRoute('sign-out');
    this.authService.auth.signOut()
      .then(() => {
        this.screen = 'success';
        this.authService.onSignedOut();
      });
  }
}
