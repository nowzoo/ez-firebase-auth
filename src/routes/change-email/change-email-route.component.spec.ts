import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeEmailRouteComponent } from './change-email-route.component';

describe('ChangeEmailRouteComponent', () => {
  let component: ChangeEmailRouteComponent;
  let fixture: ComponentFixture<ChangeEmailRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeEmailRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeEmailRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
