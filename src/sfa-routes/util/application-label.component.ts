import { Component, OnInit } from '@angular/core';
import { SfaService } from '../../sfa/sfa.service';

@Component({
  selector: 'sfa-application-label',
  template: `{{label}}`
})
export class ApplicationLabelComponent implements OnInit {

  public label: string;
  constructor(
    private authService: SfaService
  ) { }

  public ngOnInit() {
    this.label = this.authService.applicationLabel;
  }

}
