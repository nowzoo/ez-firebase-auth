import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendResetPasswordLinkRouteComponent } from './send-reset-password-link-route.component';

describe('SendResetPasswordLinkRouteComponent', () => {
  let component: SendResetPasswordLinkRouteComponent;
  let fixture: ComponentFixture<SendResetPasswordLinkRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendResetPasswordLinkRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendResetPasswordLinkRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
