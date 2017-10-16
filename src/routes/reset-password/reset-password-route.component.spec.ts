import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordRouteComponent } from './reset-password-route.component';

describe('ResetPasswordRouteComponent', () => {
  let component: ResetPasswordRouteComponent;
  let fixture: ComponentFixture<ResetPasswordRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetPasswordRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
