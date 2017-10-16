import { Directive, Input, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';

@Directive({
  selector: '[sfaProviderTitle]'
})
export class ProviderTitleDirective implements OnInit {
  @Input() sfaProviderTitle: {label: string, id: string};

  constructor(
    protected renderer: Renderer2,
    protected elementRef: ElementRef,
    protected authService: SimpleFirebaseAuthService

  ) { }
  ngOnInit () {
    let title = this.sfaProviderTitle.label + ' ' + this.authService.providerLabels[this.sfaProviderTitle.id]
    this.renderer.setAttribute(this.elementRef.nativeElement, 'title', title )
  }
}
