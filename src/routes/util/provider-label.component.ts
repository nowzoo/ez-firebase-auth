import { Component, OnInit, Input } from '@angular/core';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
@Component({
  selector: 'sfa-provider-label',
  template: `{{label}}`,
})
export class ProviderLabelComponent implements OnInit {
  @Input() public providerId: string;
  public label: any;
  constructor(
    protected authService: SimpleFirebaseAuthService
  ) { }

  public ngOnInit() {
    const labels = this.authService.providerLabels as any;
    this.label = labels[this.providerId] || '';
  }
}
