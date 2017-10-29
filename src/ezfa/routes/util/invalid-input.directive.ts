import { Directive, Input, OnDestroy, AfterViewInit, Renderer2, ElementRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';

@Directive({
  selector: '[ezfaInvalidInput]'
})
export class InvalidInputDirective implements AfterViewInit, OnDestroy {
  @Input() public ezfaInvalidInput: AbstractControl;

  ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    public renderer: Renderer2,
    public elementRef: ElementRef
  ) { }

  ngAfterViewInit() {
    this.ezfaInvalidInput.statusChanges
      .combineLatest(this.ezfaInvalidInput.valueChanges)
      .takeUntil(this.ngUnsubscribe).subscribe(() => {
        this.update();
      });

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  update() {
    const $el = this.elementRef.nativeElement;
    if (this.ezfaInvalidInput.invalid && this.ezfaInvalidInput.dirty) {
      this.renderer.addClass($el, 'is-invalid');
    } else {
      this.renderer.removeClass($el, 'is-invalid');
    }
  }

}
