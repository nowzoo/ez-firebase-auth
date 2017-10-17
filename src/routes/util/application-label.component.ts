import { Component, OnInit } from '@angular/core';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';

@Component({
  selector: 'sfa-application-label',
  template: `{{label}}`
})
export class ApplicationLabelComponent implements OnInit {

  public label: string;
  constructor(
    private authService: SimpleFirebaseAuthService
  ) { }

  public ngOnInit() {
    this.label = this.authService.applicationLabel;
  }

}
