import {  ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as HELPER from '../../test';
import { EzfaService } from '../../ezfa.service';
import { EzfaSignedOutEvent } from '../../ezfa-signed-out-event.class';
import { Messages } from '../messages.enum';

import { SignOutRouteComponent } from './sign-out-route.component';

describe('SignOutRouteComponent', () => {
  let component: SignOutRouteComponent;
  let fixture: ComponentFixture<SignOutRouteComponent>;

  let authState$: BehaviorSubject<any>;
  let service;
  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    service = HELPER.getMockService(authState$);

    TestBed.configureTestingModule({
      imports: [...HELPER.MOCK_IMPORTS],
      declarations: [
        SignOutRouteComponent,
        ...HELPER.MOCK_UTILITIES_DECLARATIONS
      ],
      providers: [
          {provide: EzfaService, useValue: service}
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(SignOutRouteComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call onRouteChange', () => {
      spyOn(component.service, 'onRouteChange').and.callThrough();
      component.ngOnInit();
      expect(component.service.onRouteChange).toHaveBeenCalledWith('sign-out');
    });
    it('should call auth.signOut', () => {
      spyOn(component.service.auth, 'signOut').and.callThrough();
      component.ngOnInit();
      expect(component.service.auth.signOut).toHaveBeenCalledWith();
    });
    it('should call onSignedOut', fakeAsync(() => {
      spyOn(component.service.auth, 'signOut').and.callFake(() => Promise.resolve());
      spyOn(component.service, 'onSignedOut').and.callThrough();
      component.ngOnInit();
      tick();
      expect(component.service.onSignedOut).toHaveBeenCalledWith(jasmine.any(EzfaSignedOutEvent));
    }));
    it('should navigate to sign in if the event is not cancelled', fakeAsync(() => {
      spyOn(component.service.auth, 'signOut').and.callFake(() => Promise.resolve());
      spyOn(component.service, 'navigate').and.callThrough();
      component.service.signedOutEvents.subscribe(event => event.redirectCancelled = false);
      component.ngOnInit();
      tick();
      expect(component.service.navigate).toHaveBeenCalledWith('sign-in', {queryParams: {message: Messages.signedOut}});
    }));
    it('should not navigate to sign in if the event is cancelled', fakeAsync(() => {
      spyOn(component.service.auth, 'signOut').and.callFake(() => Promise.resolve());
      spyOn(component.service, 'navigate').and.callThrough();
      component.service.signedOutEvents.subscribe(event => event.redirectCancelled = true);
      component.ngOnInit();
      tick();
      expect(component.service.navigate).not.toHaveBeenCalled();
    }));
  });
});
