import { Component, OnInit } from '@angular/core';
import { EzfaService } from '../../ezfa.service';
import { EzfaSignedOutEvent } from '../../ezfa-signed-out-event.class';
import { BaseComponent } from '../base.component';
import { Messages } from '../messages.enum';

@Component({
  selector: 'ezfa-sign-out-route',
  templateUrl: './sign-out-route.component.html',
  styleUrls: ['./sign-out-route.component.scss']
})
export class SignOutRouteComponent extends BaseComponent implements OnInit {

  public screen: 'wait'|'success' = 'wait';
  constructor(
    service: EzfaService
  ) {
    super(service);
  }
  public ngOnInit() {
    this.service.onRouteChange('sign-out');
    this.service.auth.signOut()
      .then(() => {
        const event = new EzfaSignedOutEvent();
        this.screen = 'success';
        this.service.onSignedOut(event);
        if (! event.redirectCancelled) {
          this.service.navigate('sign-in', {queryParams: {message: Messages.signedOut}});
        }
      });
  }
}
