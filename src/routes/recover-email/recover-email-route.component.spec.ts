import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoverEmailRouteComponent } from './recover-email-route.component';

describe('RecoverEmailRouteComponent', () => {
  let component: RecoverEmailRouteComponent;
  let fixture: ComponentFixture<RecoverEmailRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecoverEmailRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecoverEmailRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
