import { fakeAsync, tick } from '@angular/core/testing';

import { InvalidInputDirective } from './invalid-input.directive';
import { FormControl } from '@angular/forms';
describe('InvalidInputDirective', () => {
  const renderer: any = {addClass: () => {}, removeClass: () => {}};
  const elementRef = {nativeElement: {foo: 'bar'}};
  let directive: InvalidInputDirective;
  let fc: FormControl;
  beforeEach (() => {
    fc = new FormControl('');
    directive = new  InvalidInputDirective(renderer, elementRef);
    directive.ezfaInvalidInput = fc;
    // spyOn(renderer, 'addClass').and.callThrough();
    // spyOn(renderer, 'removeClass').and.callThrough();
  });
  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
  describe('ngOnDestroy()', () => {
    it('should deal with unsubscribing from the control', fakeAsync(() => {
      let unsub = false;
      directive.ngUnsubscribe.subscribe(_ => unsub = true);
      directive.ngOnDestroy();
      expect(unsub).toBe(true);
    }));
  });

  describe('ngAfterViewInit()', () => {
    it('should watch for changes on the fc', fakeAsync(() => {
      spyOn(directive, 'update').and.callThrough();
      directive.ngAfterViewInit();
      fc.setErrors({foo: true});
      fc.updateValueAndValidity();
      expect(directive.update).toHaveBeenCalledWith();
    }));
  });

  describe('update()', () => {
    it ('should remove the class if the fc is valid', () => {
      fc.setErrors(null);
      spyOn(renderer, 'removeClass').and.callThrough();
      directive.update();
      expect(renderer.removeClass).toHaveBeenCalledWith(elementRef.nativeElement, 'is-invalid');
    });
    it ('should remove the class if the fc is invalid but pristine', () => {
      fc.setErrors({foo: true});
      fc.markAsPristine();
      spyOn(renderer, 'removeClass').and.callThrough();
      directive.update();
      expect(renderer.removeClass).toHaveBeenCalledWith(elementRef.nativeElement, 'is-invalid');
    });
    it ('should add the class if the fc is invalid and dirty', () => {
      fc.setErrors({foo: true});
      fc.markAsDirty();
      spyOn(renderer, 'addClass').and.callThrough();
      directive.update();
      expect(renderer.addClass).toHaveBeenCalledWith(elementRef.nativeElement, 'is-invalid');
    });
  });
});
