import { Directive, Input, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { SimpleFirebaseAuthService } from '../../simple-firebase-auth.service';

@Directive({
  selector: '[sfaProviderTitle]'
})
export class ProviderTitleDirective implements OnInit {
  @Input() public sfaProviderTitle: {label: string, id: string};

  constructor(
    protected renderer: Renderer2,
    protected elementRef: ElementRef,
    protected authService: SimpleFirebaseAuthService

  ) { }
  public ngOnInit() {
    const labels = this.authService.providerLabels as any;
    const title = this.sfaProviderTitle.label + ' ' + labels[this.sfaProviderTitle.id];
    this.renderer.setAttribute(this.elementRef.nativeElement, 'title', title);
  }
}
