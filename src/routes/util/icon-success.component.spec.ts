import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconSuccessComponent } from './icon-success.component';

describe('IconSuccessComponent', () => {
  let component: IconSuccessComponent;
  let fixture: ComponentFixture<IconSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IconSuccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
