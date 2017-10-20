import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailSignInFormComponent } from './email-sign-in-form.component';

describe('EmailSignInFormComponent', () => {
  let component: EmailSignInFormComponent;
  let fixture: ComponentFixture<EmailSignInFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailSignInFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailSignInFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
