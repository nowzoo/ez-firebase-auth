import { Directive, Input, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/combineLatest';
import * as _ from 'lodash';

@Directive({
  selector: '[sfaInvalidInput]'
})
export class InvalidInputDirective {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  @Input() sfaInvalidInput: AbstractControl;
  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) { }

  private update(){
    let $el = this.elementRef.nativeElement;
    if (this.sfaInvalidInput.invalid && this.sfaInvalidInput.dirty){
      this.renderer.addClass($el, 'is-invalid');
    } else {
      this.renderer.removeClass($el, 'is-invalid');
    }
  }


  ngOnInit(){

  }

  ngAfterViewInit(){
    this.sfaInvalidInput.statusChanges.combineLatest(this.sfaInvalidInput.valueChanges).takeUntil(this.ngUnsubscribe).subscribe(() =>{
      this.update();
    })

  }

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
