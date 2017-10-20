import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'sfa-provider-icon',
  template: `<i [ngClass]="classes" aria-hidden="true"></i>`,
})
export class ProviderIconComponent implements OnInit {

  public static PROVIDER_ICONS: any = {
    'password': 'fa fa-fw fa-envelope',
    'twitter.com': 'fa fa-fw fa-twitter',
    'facebook.com': 'fa fa-fw fa-facebook',
    'github.com': 'fa fa-fw fa-github',
    'google.com': 'fa fa-fw fa-google',
  };

  @Input() public providerId: string;
  public classes: string;

  public ngOnInit() {
    this.classes = ProviderIconComponent.PROVIDER_ICONS[this.providerId] as string || '';
  }
}
