import * as firebase from 'firebase';

export class EzfaProviderUnlinkedEvent {
  static type = 'EzfaProviderUnlinkedEvent';
  constructor(
    public user: firebase.User,
    public providerId: string
  ) { }
}
