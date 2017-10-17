import * as firebase from 'firebase';
export interface IAuthEmailChangedEvent {
  user: firebase.User;
  oldEmail: string;
  newEmail: string;
}
