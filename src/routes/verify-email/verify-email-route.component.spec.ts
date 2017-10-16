import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyEmailRouteComponent } from './verify-email-route.component';

describe('VerifyEmailRouteComponent', () => {
  let component: VerifyEmailRouteComponent;
  let fixture: ComponentFixture<VerifyEmailRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyEmailRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyEmailRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
