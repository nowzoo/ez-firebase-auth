import * as firebase from 'firebase';

export class EzfaSignedOutEvent {
  static type = 'EzfaSignedOutEvent';
  redirectCancelled = false;
}
