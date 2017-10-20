import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReauthenticateRouteComponent } from './reauthenticate-route.component';

describe('ReauthenticateRouteComponent', () => {
  let component: ReauthenticateRouteComponent;
  let fixture: ComponentFixture<ReauthenticateRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReauthenticateRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReauthenticateRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
