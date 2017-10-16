import * as firebase from 'firebase';
export interface AuthEmailChangedEvent {
  user: firebase.User,
  oldEmail: string,
  newEmail: string
}
