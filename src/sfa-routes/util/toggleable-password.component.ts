import { Component, Input, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'sfa-toggleable-password',
  template: `
  <div class="input-group">
    <ng-content></ng-content>
    <span class="input-group-btn">
      <button class="btn btn-outline-secondary" type="button" (click)="toggle()">
        <span *ngIf="!visible" title="Show Password">
          <i class="fa fa-eye fa-fw" aria-hidden="true"></i>
          <span class="sr-only">Hide Password</span>
        </span>
        <span *ngIf="visible" title="Hide Password">
          <i class="fa fa-eye-slash fa-fw" aria-hidden="true"></i>
          <span class="sr-only">Show Password</span>
        </span>
      </button>
    </span>
  </div>
  `
})
export class ToggleablePasswordComponent  {
  @Input() public control: ElementRef;
  public visible = false;
  constructor(
    protected renderer: Renderer2
  ) {
    console.log(renderer)
  }

  public toggle() {
    this.visible = ! this.visible;
    const type = this.visible ? 'text' : 'password';
    this.renderer.setAttribute(this.control.nativeElement, 'type', type);
  }
}
