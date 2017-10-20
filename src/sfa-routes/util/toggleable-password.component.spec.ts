import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleablePasswordComponent } from './toggleable-password.component';
import { Renderer2 } from '@angular/core';
describe('ToggleablePasswordComponent', () => {
  let component: ToggleablePasswordComponent;
  let fixture: ComponentFixture<ToggleablePasswordComponent>;
  const renderer = {setAttribute: () => {}};
  const elementRef = {nativeElement: {}};


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ToggleablePasswordComponent ]
    })
    .compileComponents();
    spyOn(renderer, 'setAttribute').and.callThrough();
    fixture = TestBed.createComponent(ToggleablePasswordComponent);
    component = fixture.componentInstance;
    component.control = elementRef;
    spyOn(component.renderer, 'setAttribute').and.callFake(() => {});
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('toggle()', () => {
    it('should toggle the type attribute', () => {
      expect(component.visible).toBe(false);
      component.toggle();
      expect(component.visible).toBe(true);
      expect(component.renderer.setAttribute).toHaveBeenCalledWith(elementRef.nativeElement, 'type', 'text');
      component.toggle();
      expect(component.visible).toBe(false);
      expect(component.renderer.setAttribute).toHaveBeenCalledWith(elementRef.nativeElement, 'type', 'password');
    })
  })
});
