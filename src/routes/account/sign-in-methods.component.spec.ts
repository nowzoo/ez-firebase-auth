import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInMethodsComponent } from './sign-in-methods.component';

describe('SignInMethodsComponent', () => {
  let component: SignInMethodsComponent;
  let fixture: ComponentFixture<SignInMethodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInMethodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
