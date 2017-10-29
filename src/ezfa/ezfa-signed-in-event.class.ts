import * as firebase from 'firebase';

export class EzfaSignedInEvent {
  static type = 'EzfaSignedInEvent';
  redirectCancelled = false;
  constructor(
    public user: firebase.User,
    public providerId: string,
    public credential: firebase.auth.UserCredential = null
  ) { }
}
