import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnlinkRouteComponent } from './unlink-route.component';

describe('UnlinkRouteComponent', () => {
  let component: UnlinkRouteComponent;
  let fixture: ComponentFixture<UnlinkRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnlinkRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnlinkRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
