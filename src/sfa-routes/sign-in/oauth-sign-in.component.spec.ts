import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


import { OauthSignInComponent } from './oauth-sign-in.component';
import { OAuthMethod } from '../../sfa/sfa';
import { IAuthUserEvent } from '../../sfa/sfa';

import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET
 } from '../test';


describe('OauthSignInComponent angular sanity check', () => {
  let component: OauthSignInComponent;
  let fixture: ComponentFixture<OauthSignInComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        OauthSignInComponent,
        ...MOCK_UTILITIES_DECLARATIONS
      ],
      providers: [
        ...MOCK_PROVIDERS
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(OauthSignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
