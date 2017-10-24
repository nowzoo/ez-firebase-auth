import { Component, OnInit, OnChanges, Input } from '@angular/core';
import * as _ from 'lodash';
import { SfaService } from '../../sfa/sfa.service';
@Component({
  selector: 'sfa-providers-list-phrase',
  template: `{{phrase}}`,
})
export class ProvidersListPhraseComponent implements OnInit {
  @Input() public providerIds: string[];
  @Input() public andOr: string;
  public phrase: string;

  constructor(
    protected authService: SfaService
  ) { }

  public ngOnInit() {
    const labels = this.authService.providerLabels as any;
    const included: string[] = _.compact(_.map(this.providerIds, (id) => {
      return labels[id] || null;
    }));
    const last = included.pop();
    if (included.length) {
      this.phrase = included.join(', ') + ' ' + this.andOr + ' ' + last;
    } else {
      if (last) {
        this.phrase = last;
      } else {
        this.phrase = '';
      }
    }

  }
}
