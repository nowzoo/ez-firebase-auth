import { Component, OnInit } from '@angular/core';
import { SfaService } from '../../sfa/sfa.service';
@Component({
  selector: 'sfa-sign-out-route',
  templateUrl: './sign-out-route.component.html',
  styleUrls: ['./sign-out-route.component.scss']
})
export class SignOutRouteComponent implements OnInit {

  public screen: 'wait'|'success' = 'wait';
  constructor(
    protected authService: SfaService
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
