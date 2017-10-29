import { ProviderTitleDirective } from './provider-title.directive';
describe('ProviderTitleDirective', () => {
  const renderer: any = {setAttribute: () => {}};
  const elementRef = {nativeElement: {}};
  const authService: any = {providerLabels: {'twitter.com': 'Twitter'}};

  let directive: ProviderTitleDirective;

  beforeEach(() => {
    spyOn(renderer, 'setAttribute').and.callThrough();
    directive = new ProviderTitleDirective(renderer, elementRef, authService);
  });
  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should set the title', () => {
      directive.sfaProviderTitle = {label: 'Sign in with', id: 'twitter.com'};
      directive.ngOnInit();
      expect(renderer.setAttribute).toHaveBeenCalledWith(elementRef.nativeElement, 'title', 'Sign in with Twitter');

    });
  });
});
