import { Component, OnInit } from '@angular/core';
import { EzfaService } from '../../ezfa.service';

@Component({
  selector: 'ezfa-application-label',
  template: `{{label}}`
})
export class ApplicationLabelComponent implements OnInit {

  public label: string;
  constructor(
    private authService: EzfaService
  ) { }

  public ngOnInit() {
    this.label = this.authService.applicationLabel;
  }

}
