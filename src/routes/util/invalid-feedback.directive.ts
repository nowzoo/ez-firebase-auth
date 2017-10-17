import { Directive, Input, OnInit, AfterViewInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/combineLatest';
import * as _ from '../../lodash-funcs';
@Directive({
  selector: '[sfaInvalidFeedback]'
})
export class InvalidFeedbackDirective implements OnInit, AfterViewInit, OnDestroy {
  @Input() public sfaInvalidFeedback: AbstractControl;
  @Input() public key: string| string[];
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(
    protected renderer: Renderer2,
    protected elementRef: ElementRef
  ) { }

  public ngOnInit() {
    const $el = this.elementRef.nativeElement;
    this.renderer.addClass($el, 'invalid-feedback');
    this.hide();

  }

  public ngAfterViewInit() {
    this.sfaInvalidFeedback.statusChanges
      .combineLatest(this.sfaInvalidFeedback.valueChanges)
      .takeUntil(this.ngUnsubscribe).subscribe(() => {
        this.update();
      });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  protected hide() {
    const $el = this.elementRef.nativeElement;
    this.renderer.setStyle($el, 'display', 'none');
    this.renderer.setAttribute($el, 'aria-hidden', 'true');
  }
  protected show() {
    const $el = this.elementRef.nativeElement;
    this.renderer.setStyle($el, 'display', 'block');
    this.renderer.setAttribute($el, 'aria-hidden', 'false');
  }

  protected update() {
    const keys = _.isArray(this.key) ? this.key : [this.key];
    let hasError = false;
    _.each(keys, (key) => {
      if (this.sfaInvalidFeedback.hasError(key)) {
        hasError = true;
      }
    });
    const shown = this.sfaInvalidFeedback.dirty &&
        this.sfaInvalidFeedback.invalid &&
        hasError;
    if (shown) {
      this.show();
    } else {
      this.hide();
    }
  }

}
