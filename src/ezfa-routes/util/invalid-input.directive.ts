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

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected renderer: Renderer2,
    protected elementRef: ElementRef
  ) { }

  public ngAfterViewInit() {
    this.ezfaInvalidInput.statusChanges
      .combineLatest(this.ezfaInvalidInput.valueChanges)
      .takeUntil(this.ngUnsubscribe).subscribe(() => {
        this.update();
      });

  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  protected update() {
    const $el = this.elementRef.nativeElement;
    if (this.ezfaInvalidInput.invalid && this.ezfaInvalidInput.dirty) {
      this.renderer.addClass($el, 'is-invalid');
    } else {
      this.renderer.removeClass($el, 'is-invalid');
    }
  }

}
