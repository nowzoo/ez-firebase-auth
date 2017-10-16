import { Component, OnInit, Input } from '@angular/core';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
@Component({
  selector: 'sfa-provider-label',
  template: `{{label}}`,
})
export class ProviderLabelComponent implements OnInit {
  @Input() providerId: string;
  label: string;
  constructor(
    protected authService: SimpleFirebaseAuthService
  ) { }

  ngOnInit() {
    this.label = this.authService.providerLabels[this.providerId] || '';
  }
}
