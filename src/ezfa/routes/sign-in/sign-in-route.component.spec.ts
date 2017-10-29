import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { MockComponent } from 'ng2-mock-component';

import * as HELPER from '../../test';
import { EzfaService } from '../../ezfa.service';
import { SignInRouteComponent } from './sign-in-route.component';

describe('SignInRouteComponent', () => {
  let component: SignInRouteComponent;
  let fixture: ComponentFixture<SignInRouteComponent>;
  let service;
  let authState$: BehaviorSubject<any>;
  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    service = HELPER.getMockService(authState$);
    TestBed.configureTestingModule({
      imports: [...HELPER.MOCK_IMPORTS],
      declarations: [
        SignInRouteComponent,
        ...HELPER.MOCK_UTILITIES_DECLARATIONS,
        MockComponent({ selector: 'ezfa-email-sign-in-form', inputs: ['email']}),
        MockComponent({ selector: 'ezfa-oauth-sign-in'}),
        MockComponent({ selector: 'ezfa-persistence-form'})
      ],
      providers: [
          {provide: EzfaService, useValue: service},
      ]

    })
    .compileComponents();
    fixture = TestBed.createComponent(SignInRouteComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call onRouteChange', () => {
      spyOn(component.service, 'onRouteChange').and.callThrough();
      component.ngOnInit();
      expect(component.service.onRouteChange).toHaveBeenCalledWith('sign-in');
    });
    it('should call onInitLoadUser', () => {
      spyOn(component, 'onInitLoadUser').and.callThrough();
      component.ngOnInit();
      expect(component.onInitLoadUser).toHaveBeenCalledWith();
    });
    it('should navigate if there is a user', fakeAsync(() => {
      authState$.next(HELPER.MOCK_USER);
      spyOn(component.service, 'navigate').and.callThrough();
      component.ngOnInit();
      tick();
      expect(component.service.navigate).toHaveBeenCalledWith();
    }));
    it('should not navigate if there is no user', fakeAsync(() => {
      authState$.next(null);
      spyOn(component.service, 'navigate').and.callThrough();
      component.ngOnInit();
      tick();
      expect(component.service.navigate).not.toHaveBeenCalled();
    }));
  });
});
