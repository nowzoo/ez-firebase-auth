import { AbstractControl } from '@angular/forms';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import isEmail from 'validator/lib/isEmail';

export const validateEmail = (fc: AbstractControl) => {
  const value = _.trim(fc.value);
  if (value.length === 0){
    return null;
  }
  return isEmail(value) ? null : {email: true};
}

export const clearControlErrors = (fc: AbstractControl, keys: string[]) => {
  const orig = fc.errors;
  if (! orig){
    return;
  }
  const updated = _.omit(orig, keys);
  fc.setErrors(updated);
}


export const firebaseToFormError = (error: firebase.FirebaseError): any => {
  const formError = {};
  formError[error.code] = true;
  return formError;
}
