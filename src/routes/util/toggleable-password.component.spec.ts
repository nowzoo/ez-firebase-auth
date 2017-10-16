import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleablePasswordComponent } from './toggleable-password.component';

describe('ToggleablePasswordComponent', () => {
  let component: ToggleablePasswordComponent;
  let fixture: ComponentFixture<ToggleablePasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToggleablePasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleablePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
