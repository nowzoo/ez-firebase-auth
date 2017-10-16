import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPasswordRouteComponent } from './add-password-route.component';

describe('AddPasswordRouteComponent', () => {
  let component: AddPasswordRouteComponent;
  let fixture: ComponentFixture<AddPasswordRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPasswordRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPasswordRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
