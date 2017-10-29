import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IndexRouteComponent } from './index-route.component';


import * as HELPER from '../../test';
import { Messages } from '../messages.enum';

import { EzfaService } from '../../ezfa.service';

describe('IndexRouteComponent angular sanity check', () => {

  let component: IndexRouteComponent;
  let fixture: ComponentFixture<IndexRouteComponent>;
  let service;
  let authState$: BehaviorSubject<any>;

  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    service = HELPER.getMockService(authState$);
    TestBed.configureTestingModule({
      declarations: [
        IndexRouteComponent,
        ...HELPER.MOCK_UTILITIES_DECLARATIONS
      ],
      imports: [ ...HELPER.MOCK_IMPORTS ],
      providers: [
        {provide: EzfaService, useValue: service}
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(IndexRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should redirect to sign-in if the user is not signed in and there is no action code', () => {
      spyOn(component.service, 'navigate').and.callThrough();
      component.route.snapshot.queryParams = {};
      authState$.next(null);
      component.ngOnInit();
      expect(component.service.navigate).toHaveBeenCalledWith('sign-in');
    });
    it('should redirect to account if the user is signed in and there is no action code', () => {
      spyOn(component.service, 'navigate').and.callThrough();
      component.route.snapshot.queryParams = {};
      authState$.next(HELPER.MOCK_USER);
      component.ngOnInit();
      expect(component.service.navigate).toHaveBeenCalledWith('account');
    });
    it('should redirect to sign-in if the user is not signed in and oobCode is not set in the query', () => {
      spyOn(component.service, 'navigate').and.callThrough();
      component.route.snapshot.queryParams = {mode: EzfaService.OUT_OF_BAND_MODES.resetPassword};
      authState$.next(null);
      component.ngOnInit();
      expect(component.service.navigate).toHaveBeenCalledWith('sign-in');
    });
    it('should redirect to sign-in if the user is signed in and oobCode is not set in the query', () => {
      spyOn(component.service, 'navigate').and.callThrough();
      component.route.snapshot.queryParams = {mode: EzfaService.OUT_OF_BAND_MODES.resetPassword};
      authState$.next(HELPER.MOCK_USER);
      component.ngOnInit();
      expect(component.service.navigate).toHaveBeenCalledWith('account');
    });
    it('should redirect to reset-password if that is the mode and oobCode is set', () => {
      spyOn(component.service, 'navigate').and.callThrough();
      component.route.snapshot.queryParams = {mode: EzfaService.OUT_OF_BAND_MODES.resetPassword, oobCode: 'jkshkjhskjh'};
      component.ngOnInit();
      expect(component.service.navigate).toHaveBeenCalledWith('reset-password', { queryParamsHandling: 'preserve' });
    });
    it('should redirect to recover-email if that is the mode and oobCode is set', () => {
      spyOn(component.service, 'navigate').and.callThrough();
      component.route.snapshot.queryParams = {mode: EzfaService.OUT_OF_BAND_MODES.recoverEmail, oobCode: 'jkshkjhskjh'};
      component.ngOnInit();
      expect(component.service.navigate).toHaveBeenCalledWith('recover-email', { queryParamsHandling: 'preserve' });
    });
    it('should redirect to verify-email if that is the mode and oobCode is set', () => {
      spyOn(component.service, 'navigate').and.callThrough();
      component.route.snapshot.queryParams = {mode: EzfaService.OUT_OF_BAND_MODES.verifyEmail, oobCode: 'jkshkjhskjh'};
      component.ngOnInit();
      expect(component.service.navigate).toHaveBeenCalledWith('verify-email', { queryParamsHandling: 'preserve' });
    });
  });
});
