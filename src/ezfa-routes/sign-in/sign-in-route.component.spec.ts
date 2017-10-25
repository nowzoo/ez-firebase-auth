import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { MockComponent } from 'ng2-mock-component';

import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET
 } from '../../test';

import { SignInRouteComponent } from './sign-in-route.component';

describe('SignInRouteComponent', () => {
  let component: SignInRouteComponent;
  let fixture: ComponentFixture<SignInRouteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...MOCK_IMPORTS],
      declarations: [
        SignInRouteComponent,
        ...MOCK_UTILITIES_DECLARATIONS,
        MockComponent({ selector: 'ezfa-email-sign-in-form', inputs: ['email']}),
        MockComponent({ selector: 'ezfa-oauth-sign-in'}),
        MockComponent({ selector: 'ezfa-persistence-form'})
      ],
      providers: [
        ...MOCK_PROVIDERS
      ]

    })
    .compileComponents();
    fixture = TestBed.createComponent(SignInRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
