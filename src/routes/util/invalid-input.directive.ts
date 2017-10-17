import { Directive, Input, OnDestroy, AfterViewInit, Renderer2, ElementRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/combineLatest';
import * as _ from '../../lodash-funcs';

@Directive({
  selector: '[sfaInvalidInput]'
})
export class InvalidInputDirective implements AfterViewInit, OnDestroy {
  @Input() public sfaInvalidInput: AbstractControl;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    protected renderer: Renderer2,
    protected elementRef: ElementRef
  ) { }

  public ngAfterViewInit() {
    this.sfaInvalidInput.statusChanges
      .combineLatest(this.sfaInvalidInput.valueChanges)
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
    if (this.sfaInvalidInput.invalid && this.sfaInvalidInput.dirty) {
      this.renderer.addClass($el, 'is-invalid');
    } else {
      this.renderer.removeClass($el, 'is-invalid');
    }
  }

}
