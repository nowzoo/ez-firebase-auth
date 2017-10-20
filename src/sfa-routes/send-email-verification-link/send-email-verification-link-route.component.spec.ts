import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendEmailVerificationLinkRouteComponent } from './send-email-verification-link-route.component';

describe('SendEmailVerificationLinkRouteComponent', () => {
  let component: SendEmailVerificationLinkRouteComponent;
  let fixture: ComponentFixture<SendEmailVerificationLinkRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendEmailVerificationLinkRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendEmailVerificationLinkRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
