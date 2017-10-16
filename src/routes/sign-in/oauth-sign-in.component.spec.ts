import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OauthSignInComponent } from './oauth-sign-in.component';

describe('OauthSignInComponent', () => {
  let component: OauthSignInComponent;
  let fixture: ComponentFixture<OauthSignInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OauthSignInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OauthSignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
