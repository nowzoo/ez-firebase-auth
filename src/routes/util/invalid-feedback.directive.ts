import { Directive, Input, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/combineLatest';
import * as _ from 'lodash';
@Directive({
  selector: '[sfaInvalidFeedback]'
})
export class InvalidFeedbackDirective implements OnInit, OnDestroy{
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  @Input() sfaInvalidFeedback: AbstractControl;
  @Input() key: string| string[];
  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) { }

  private hide() {
    let $el = this.elementRef.nativeElement
    this.renderer.setStyle($el, 'display', 'none');
    this.renderer.setAttribute($el, 'aria-hidden', 'true');
  }
  private show() {
    let $el = this.elementRef.nativeElement
    this.renderer.setStyle($el, 'display', 'block');
    this.renderer.setAttribute($el, 'aria-hidden', 'false');
  }

  private update(){
    const keys = _.isArray(this.key) ? this.key : [this.key];
    let hasError = false;

    _.each(keys, key => {
      if (this.sfaInvalidFeedback.hasError(key)){
        hasError = true;
      }
    })
    const shown = this.sfaInvalidFeedback.dirty &&
        this.sfaInvalidFeedback.invalid &&
        hasError;

    if (shown) {
      this.show();
    } else {
      this.hide();
    }
  }

  ngOnInit(){
    let $el = this.elementRef.nativeElement;
    this.renderer.addClass($el, 'invalid-feedback');
    this.hide();

  }

  ngAfterViewInit(){
    this.sfaInvalidFeedback.statusChanges.combineLatest(this.sfaInvalidFeedback.valueChanges).takeUntil(this.ngUnsubscribe).subscribe(() =>{
      this.update();
    })
  }

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
