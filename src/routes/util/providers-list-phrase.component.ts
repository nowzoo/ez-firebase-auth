import { Component, OnInit, OnChanges, Input } from '@angular/core';
import * as _ from 'lodash';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';
@Component({
  selector: 'sfa-providers-list-phrase',
  template: `{{phrase}}`,
})
export class ProvidersListPhrase implements OnInit {
  @Input() providerIds: string[];
  @Input() andOr: string;
  phrase: string;

  constructor(
    protected authService: SimpleFirebaseAuthService
  ) { }

  ngOnInit() {
    let labels: string[] = _.compact(_.map(this.providerIds, id => {
      return this.authService.providerLabels[id] || null
    }));
    let last = labels.pop();
    if (labels.length) {
      this.phrase = labels.join(', ') + ' ' + this.andOr + ' ' + last;
    } else {
      if (last) {
        this.phrase = last;
      } else {
        this.phrase = '';
      }
    }

  }
}
