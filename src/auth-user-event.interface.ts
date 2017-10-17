import * as firebase from 'firebase';
export interface IAuthUserEvent {
  user: firebase.User;
  providerId: string;
  credential?: firebase.auth.UserCredential;
}
