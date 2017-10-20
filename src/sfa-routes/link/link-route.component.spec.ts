import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkRouteComponent } from './link-route.component';

describe('LinkRouteComponent', () => {
  let component: LinkRouteComponent;
  let fixture: ComponentFixture<LinkRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
