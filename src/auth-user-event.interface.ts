import * as firebase from 'firebase';
export interface AuthUserEvent {
  user: firebase.User,
  providerId: string,
  credential?: firebase.auth.UserCredential
}
