import * as firebase from 'firebase';

export class EzfaProviderLinkedEvent {
  static type = 'EzfaProviderLinkedEvent';
  constructor(
    public user: firebase.User,
    public providerId: string,
    public credential: firebase.auth.UserCredential = null
  ) { }
}
