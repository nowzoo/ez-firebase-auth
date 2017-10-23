import {  ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET
 } from '../test';

import { SignOutRouteComponent } from './sign-out-route.component';

describe('SignOutRouteComponent', () => {
  let component: SignOutRouteComponent;
  let fixture: ComponentFixture<SignOutRouteComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...MOCK_IMPORTS
      ],
      declarations: [ SignOutRouteComponent, ...MOCK_UTILITIES_DECLARATIONS ],
      providers: [
        ...MOCK_PROVIDERS
      ]

    })
    .compileComponents();
    fixture = TestBed.createComponent(SignOutRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
