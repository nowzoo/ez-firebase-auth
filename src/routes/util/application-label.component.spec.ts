import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationLabelComponent } from './application-label.component';

describe('ApplicationLabelComponent', () => {
  let component: ApplicationLabelComponent;
  let fixture: ComponentFixture<ApplicationLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationLabelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
