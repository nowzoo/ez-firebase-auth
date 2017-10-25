import { Component, OnInit, Input } from '@angular/core';
import { EzfaService } from '../../ezfa/ezfa.service';
@Component({
  selector: 'ezfa-provider-label',
  template: `{{label}}`,
})
export class ProviderLabelComponent implements OnInit {
  @Input() public providerId: string;
  public label: any;
  constructor(
    protected authService: EzfaService
  ) { }

  public ngOnInit() {
    const labels = this.authService.providerLabels as any;
    this.label = labels[this.providerId] || '';
  }
}
