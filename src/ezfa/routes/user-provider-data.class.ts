import * as firebase from 'firebase';
import * as _ from 'lodash';
export class UserProviderData {
  ids: string[];
  oauthIds: string[];
  hasPassword: boolean;
  canAddPassword: boolean;
  canAddOauth: string[];
  constructor(user: firebase.User | null, enabled: string[]) {
    if (! user) {
      this.ids = [];
      this.oauthIds = [];
    } else {
      const userProviderIds = _.map(user.providerData, 'providerId');
      this.ids = _.filter(userProviderIds, id => {
        return _.includes(enabled, id);
      });
      this.oauthIds = _.filter(userProviderIds, id => {
        return _.includes(enabled, id) && 'password' !== id;
      });
    }
    this.hasPassword = _.includes(this.ids, 'password');
    this.canAddPassword = _.includes(enabled, 'password') && (! this.hasPassword);
    this.canAddOauth = _.filter(enabled, id => {
      return id !== 'password' && (! _.includes(this.oauthIds, id));
    });

  }
}
