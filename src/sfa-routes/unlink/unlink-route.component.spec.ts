import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MockComponent } from 'ng2-mock-component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SfaService } from '../../sfa/sfa.service';
import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET
 } from '../test';

import { UnlinkRouteComponent } from './unlink-route.component';

describe('UnlinkRouteComponent', () => {
  let component: UnlinkRouteComponent;
  let fixture: ComponentFixture<UnlinkRouteComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        UnlinkRouteComponent,
        ...MOCK_UTILITIES_DECLARATIONS
      ],
      providers: [...MOCK_PROVIDERS],
      imports: [...MOCK_IMPORTS]
    })
    .compileComponents();
    fixture = TestBed.createComponent(UnlinkRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
