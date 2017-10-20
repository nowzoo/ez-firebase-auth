import { Component, OnInit, Input } from '@angular/core';
import { SfaService } from '../../sfa/sfa.service';
@Component({
  selector: 'sfa-provider-label',
  template: `{{label}}`,
})
export class ProviderLabelComponent implements OnInit {
  @Input() public providerId: string;
  public label: any;
  constructor(
    protected authService: SfaService
  ) { }

  public ngOnInit() {
    const labels = this.authService.providerLabels as any;
    this.label = labels[this.providerId] || '';
  }
}
