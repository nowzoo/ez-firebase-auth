import { Component, OnInit } from '@angular/core';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';

@Component({
  selector: 'sfa-application-label',
  template: `{{label}}`
})
export class ApplicationLabelComponent implements OnInit {

  label: string;
  constructor(
    private authService: SimpleFirebaseAuthService
  ) { }

  ngOnInit() {
    this.label = this.authService.applicationLabel;
  }

}
