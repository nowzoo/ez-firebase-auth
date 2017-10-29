import { Directive, Input, AfterViewInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/combineLatest';
import * as _ from 'lodash';
@Directive({
  selector: '[ezfaInvalidFeedback]'
})
export class InvalidFeedbackDirective implements  AfterViewInit, OnDestroy {
  @Input() ezfaInvalidFeedback: AbstractControl;
  @Input() key: string| string[];
  ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(
    public renderer: Renderer2,
    public elementRef: ElementRef
  ) { }


  ngAfterViewInit() {
    const $el = this.elementRef.nativeElement;
    this.renderer.addClass($el, 'invalid-feedback');
    this.hide();

    this.ezfaInvalidFeedback.statusChanges
      .combineLatest(this.ezfaInvalidFeedback.valueChanges)
      .takeUntil(this.ngUnsubscribe).subscribe(() => {
        this.update();
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  hide() {
    const $el = this.elementRef.nativeElement;
    this.renderer.setStyle($el, 'display', 'none');
    this.renderer.setAttribute($el, 'aria-hidden', 'true');
  }
  show() {
    const $el = this.elementRef.nativeElement;
    this.renderer.setStyle($el, 'display', 'block');
    this.renderer.setAttribute($el, 'aria-hidden', 'false');
  }

  update() {
    const keys = _.isArray(this.key) ? this.key : [this.key];
    let hasError = false;
    _.each(keys, (key) => {
      if (this.ezfaInvalidFeedback.hasError(key)) {
        hasError = true;
      }
    });
    const shown = this.ezfaInvalidFeedback.dirty &&
        this.ezfaInvalidFeedback.invalid &&
        hasError;
    if (shown) {
      this.show();
    } else {
      this.hide();
    }
  }

}
