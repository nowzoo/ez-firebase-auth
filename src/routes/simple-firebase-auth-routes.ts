export enum AccountSuccessMessage {
  signedIn = 1,
  passwordAdded,
  oAuthProviderAdded
}

export const OUT_OF_BAND_MODES = {
  resetPassword: 'resetPassword',
  verifyEmail: 'verifyEmail',
  recoverEmail: 'recoverEmail'
};

export enum ReauthenticateModes {
  addPassword = 1,
  changePassword,
  changeEmail
}
