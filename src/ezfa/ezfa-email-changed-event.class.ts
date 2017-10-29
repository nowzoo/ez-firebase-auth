import * as firebase from 'firebase';

export class EzfaEmailChangedEvent {
  static type = 'EzfaEmailChangedEvent';
  constructor(
    public user: firebase.User,
    public oldEmail: string,
    public newEmail: string
  ) { }
}
