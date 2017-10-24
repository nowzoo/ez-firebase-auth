import * as Utils from './utils';
import { AbstractControl, FormControl } from '@angular/forms';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import { isEmail } from 'validator';
describe('validateEmail(fc)', () => {
  it('should return null if the value is empty', () => {
    const fc = new FormControl('');
    expect(Utils.validateEmail(fc)).toBe(null);
    fc.setValue('    ');
    expect(Utils.validateEmail(fc)).toBe(null);
  })
  it('should return {email: true} if the value is not a valid email', () => {
    const fc = new FormControl('chris@');
    expect(Utils.validateEmail(fc)).toEqual({email: true});
  })
  it('should return null if the value is a valid email', () => {
    const fc = new FormControl('chris@foo.co');
    expect(Utils.validateEmail(fc)).toEqual(null);
  })
})

describe('clearControlErrors(fc, errs)', () => {
  it('should clear the error if it is the only one', () => {
    const fc = new FormControl('');
    fc.setErrors({foo: true});
    expect(fc.hasError('foo')).toBe(true);
    Utils.clearControlErrors(fc, ['foo']);
    expect(fc.hasError('foo')).toBe(false);
    expect(fc.errors).toBe(null);

  })
  it('should clear the error if it is not the only one', () => {
    const fc = new FormControl('');
    fc.setErrors({foo: true, bar: true});
    expect(fc.hasError('foo')).toBe(true);
    Utils.clearControlErrors(fc, ['foo']);
    expect(fc.hasError('foo')).toBe(false);
    expect(fc.errors).toEqual({bar: true});

  })
  it('should clear many errors', () => {
    const fc = new FormControl('');
    fc.setErrors({foo: true, bar: true});
    expect(fc.hasError('foo')).toBe(true);
    Utils.clearControlErrors(fc, ['foo', 'bar']);
    expect(fc.hasError('foo')).toBe(false);
    expect(fc.errors).toEqual(null);

  })
});

describe('firebaseToFormError(error: firebase.FirebaseError)', () => {
  it('should return an object with error.code as the key and true as the value', () => {
    expect(Utils.firebaseToFormError({code: 'foo'})).toEqual({foo: true});
  })
})
