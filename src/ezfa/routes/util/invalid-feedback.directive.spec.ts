import { fakeAsync, tick } from '@angular/core/testing';

import { InvalidFeedbackDirective } from './invalid-feedback.directive';
import { FormControl } from '@angular/forms';
describe('InvalidFeedbackDirective', () => {
  const renderer: any = {addClass: () => {}, setStyle: () => {}, setAttribute: () => {}};
  const elementRef = {nativeElement: {foo: 'bar'}};
  let directive: InvalidFeedbackDirective;
  let fc: FormControl;
  beforeEach (() => {
    fc = new FormControl('');
    directive = new  InvalidFeedbackDirective(renderer, elementRef);
    directive.ezfaInvalidFeedback = fc;
    directive.key = 'foo';
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

    it('should add invalid-feedback class to the el', fakeAsync(() => {
      spyOn(renderer, 'addClass').and.callThrough();
      directive.ngAfterViewInit();
      expect(renderer.addClass).toHaveBeenCalledWith(elementRef.nativeElement, 'invalid-feedback');
    }));

  });

  describe('show', () => {
    it('should make the right renderer calls', () => {
      spyOn(renderer, 'setStyle').and.callThrough();
      spyOn(renderer, 'setAttribute').and.callThrough();
      directive.show();
      expect(renderer.setStyle).toHaveBeenCalledWith(elementRef.nativeElement, 'display', 'block');
      expect(renderer.setAttribute).toHaveBeenCalledWith(elementRef.nativeElement, 'aria-hidden', 'false');
    });
  });
  describe('hide', () => {
    it('should make the right renderer calls', () => {
      spyOn(renderer, 'setStyle').and.callThrough();
      spyOn(renderer, 'setAttribute').and.callThrough();
      directive.hide();
      expect(renderer.setStyle).toHaveBeenCalledWith(elementRef.nativeElement, 'display', 'none');
      expect(renderer.setAttribute).toHaveBeenCalledWith(elementRef.nativeElement, 'aria-hidden', 'true');
    });
  });

  describe('update()', () => {
    it ('should hide if the fc is valid', () => {
      fc.setErrors(null);
      spyOn(directive, 'hide').and.callThrough();
      directive.update();
      expect(directive.hide).toHaveBeenCalledWith();
    });
    it ('should hide if the fc is invalid but pristine', () => {
      fc.setErrors({foo: true});
      fc.markAsPristine();
      spyOn(directive, 'hide').and.callThrough();
      directive.update();
      expect(directive.hide).toHaveBeenCalledWith();
    });
    it ('should show if the fc is invalid and dirty', () => {
      fc.setErrors({foo: true});
      fc.markAsDirty();
      spyOn(directive, 'show').and.callThrough();
      directive.update();
      expect(directive.show).toHaveBeenCalledWith();
    });
    it('should work if keys is an array', fakeAsync(() => {
      directive.key = ['foo', 'bar'];
      fc.setErrors({bar: true});
      fc.markAsDirty();
      spyOn(directive, 'show').and.callThrough();
      directive.update();
      expect(directive.show).toHaveBeenCalledWith();
    }));
  });
});
