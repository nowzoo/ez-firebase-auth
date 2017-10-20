import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { VerifyEmailRouteComponent } from './verify-email-route.component';

describe('VerifyEmailRouteComponent', () => {
  let component: VerifyEmailRouteComponent;
  let fixture: ComponentFixture<VerifyEmailRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyEmailRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyEmailRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnDestroy()', () => {
    it('should deal with unsubscribing', fakeAsync(() => {
      let unsub = false;
      component.ngUnsubscribe.subscribe(_ => unsub = true);
      component.ngOnDestroy();
      expect(unsub).toBe(true)
    }))
  })
});
