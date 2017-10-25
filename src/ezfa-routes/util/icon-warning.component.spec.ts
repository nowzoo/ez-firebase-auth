import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconWarningComponent } from './icon-warning.component';

describe('IconWarningComponent', () => {
  let component: IconWarningComponent;
  let fixture: ComponentFixture<IconWarningComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ IconWarningComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(IconWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
