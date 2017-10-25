import {  ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IndexRouteComponent } from './index-route.component';

import { OUT_OF_BAND_MODES } from '../routes';

import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET
 } from '../../test';
describe('IndexRouteComponent angular sanity check', () => {


  let component: IndexRouteComponent;
  let fixture: ComponentFixture<IndexRouteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        IndexRouteComponent,
        ...MOCK_UTILITIES_DECLARATIONS
      ],
      imports: [ ...MOCK_IMPORTS ],
      providers: [
        ...MOCK_PROVIDERS
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
});

describe('IndexRouteComponent', () => {
  let component;
  let authState$: BehaviorSubject<any>;
  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    const sfaService: any = Object.assign({}, MOCK_AUTH_SERVICE_GET(), {
      authState: authState$.asObservable()
    });
    const route: any = Object.assign({}, MOCK_ROUTE_GET());
    route.snapshot.queryParams.providerId = 'twitter.com';
    component = new IndexRouteComponent(route, sfaService);
  });
  describe('ngOnInit', () => {
    it('should redirect to sign-in if the user is not signed in and there is no action code', () => {
      spyOn(component.authService, 'navigate').and.callThrough();
      component.route.snapshot.queryParams = {}
      authState$.next(null);
      component.ngOnInit();
      expect(component.authService.navigate).toHaveBeenCalledWith('sign-in')
    });
    it('should redirect to account if the user is signed in and there is no action code', () => {
      spyOn(component.authService, 'navigate').and.callThrough();
      component.route.snapshot.queryParams = {}
      authState$.next(MOCK_USER);
      component.ngOnInit();
      expect(component.authService.navigate).toHaveBeenCalledWith('account')
    });
    it('should redirect to sign-in if the user is not signed in and oobCode is not set in the query', () => {
      spyOn(component.authService, 'navigate').and.callThrough();
      component.route.snapshot.queryParams = {mode: OUT_OF_BAND_MODES.resetPassword}
      authState$.next(null);
      component.ngOnInit();
      expect(component.authService.navigate).toHaveBeenCalledWith('sign-in')
    });
    it('should redirect to sign-in if the user is signed in and oobCode is not set in the query', () => {
      spyOn(component.authService, 'navigate').and.callThrough();
      component.route.snapshot.queryParams = {mode: OUT_OF_BAND_MODES.resetPassword}
      authState$.next(MOCK_USER);
      component.ngOnInit();
      expect(component.authService.navigate).toHaveBeenCalledWith('account')
    });
    it('should redirect to reset-password if that is the mode and oobCode is set', () => {
      spyOn(component.authService, 'navigate').and.callThrough();
      component.route.snapshot.queryParams = {mode: OUT_OF_BAND_MODES.resetPassword, oobCode: 'jkshkjhskjh'}
      component.ngOnInit();
      expect(component.authService.navigate).toHaveBeenCalledWith('reset-password', { queryParamsHandling: 'preserve' })
    });
    it('should redirect to recover-email if that is the mode and oobCode is set', () => {
      spyOn(component.authService, 'navigate').and.callThrough();
      component.route.snapshot.queryParams = {mode: OUT_OF_BAND_MODES.recoverEmail, oobCode: 'jkshkjhskjh'}
      component.ngOnInit();
      expect(component.authService.navigate).toHaveBeenCalledWith('recover-email', { queryParamsHandling: 'preserve' })
    });
    it('should redirect to verify-email if that is the mode and oobCode is set', () => {
      spyOn(component.authService, 'navigate').and.callThrough();
      component.route.snapshot.queryParams = {mode: OUT_OF_BAND_MODES.verifyEmail, oobCode: 'jkshkjhskjh'}
      component.ngOnInit();
      expect(component.authService.navigate).toHaveBeenCalledWith('verify-email', { queryParamsHandling: 'preserve' })
    });
  })
});
