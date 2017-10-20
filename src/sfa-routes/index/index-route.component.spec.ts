import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ActivatedRoute } from '@angular/router';
import { IndexRouteComponent } from './index-route.component';

import { OUT_OF_BAND_MODES } from '../sfa-routes';
import { SfaService } from '../../sfa/sfa.service';

describe('IndexRouteComponent', () => {

  const getActivatedRoute = (qp?: any) => {
    return  {
      snapshot: {
        queryParams: qp || {}
      }
    };
  };
  const authState$: BehaviorSubject<any> = new BehaviorSubject(null);
  const sfaService = {
    authState: authState$.asObservable(),
    navigate: (p) => {}
  }

  beforeEach(async(() => {
    spyOn(sfaService, 'navigate').and.callThrough();
    TestBed.configureTestingModule({
      declarations: [ IndexRouteComponent ],
      providers: [
        {provide: ActivatedRoute, useValue: getActivatedRoute()},
        {provide: SfaService, useValue: sfaService},
      ]
    })
    .compileComponents();
  }));


  it('should be created', async(() => {
    const fixture: ComponentFixture<IndexRouteComponent> = TestBed.createComponent(IndexRouteComponent);
    const component: IndexRouteComponent = fixture.componentInstance;
    expect(component).toBeTruthy();
  }));
  it('should redirect to sign-in if the user is not signed in and there is no action code', async(() => {
    const route = getActivatedRoute();
    TestBed.overrideProvider(ActivatedRoute, {useValue: route});
    authState$.next(null);
    const fixture: ComponentFixture<IndexRouteComponent> = TestBed.createComponent(IndexRouteComponent);
    const component: IndexRouteComponent = fixture.componentInstance;
    fixture.detectChanges();
    expect(sfaService.navigate).toHaveBeenCalledWith('sign-in')
  }));
  it('should redirect to account if the user is signed in and there is no action code', async(() => {
    const route = getActivatedRoute();
    TestBed.overrideProvider(ActivatedRoute, {useValue: route});
    authState$.next({uid: 'foo'});
    const fixture: ComponentFixture<IndexRouteComponent> = TestBed.createComponent(IndexRouteComponent);
    const component: IndexRouteComponent = fixture.componentInstance;
    fixture.detectChanges();
    expect(sfaService.navigate).toHaveBeenCalledWith('account')
  }));
  it('should redirect to sign-in if the user is not signed in and oobCode is not set in the query', async(() => {
    const route = getActivatedRoute({mode: OUT_OF_BAND_MODES.resetPassword});
    TestBed.overrideProvider(ActivatedRoute, {useValue: route});
    authState$.next(null);
    const fixture: ComponentFixture<IndexRouteComponent> = TestBed.createComponent(IndexRouteComponent);
    const component: IndexRouteComponent = fixture.componentInstance;
    fixture.detectChanges();
    expect(sfaService.navigate).toHaveBeenCalledWith('sign-in')
  }));
  it('should redirect to sign-in if the user is not signed in and mode is not set in the query', async(() => {
    const route = getActivatedRoute({oobCode: 'abs'});
    TestBed.overrideProvider(ActivatedRoute, {useValue: route});
    authState$.next(null);
    const fixture: ComponentFixture<IndexRouteComponent> = TestBed.createComponent(IndexRouteComponent);
    const component: IndexRouteComponent = fixture.componentInstance;
    fixture.detectChanges();
    expect(sfaService.navigate).toHaveBeenCalledWith('sign-in')
  }));
  it('should redirect to reset password if the query has oobCode and mode is resetPassword', async(() => {
    const route = getActivatedRoute({oobCode: 'abs', mode: OUT_OF_BAND_MODES.resetPassword});
    TestBed.overrideProvider(ActivatedRoute, {useValue: route});
    authState$.next(null);
    const fixture: ComponentFixture<IndexRouteComponent> = TestBed.createComponent(IndexRouteComponent);
    const component: IndexRouteComponent = fixture.componentInstance;
    fixture.detectChanges();
    expect(sfaService.navigate).toHaveBeenCalledWith('reset-password', {queryParamsHandling: 'preserve'})
  }));
  it('should redirect to recover email if the query has oobCode and mode is recoverEmail', async(() => {
    const route = getActivatedRoute({oobCode: 'abs', mode: OUT_OF_BAND_MODES.recoverEmail});
    TestBed.overrideProvider(ActivatedRoute, {useValue: route});
    authState$.next(null);
    const fixture: ComponentFixture<IndexRouteComponent> = TestBed.createComponent(IndexRouteComponent);
    const component: IndexRouteComponent = fixture.componentInstance;
    fixture.detectChanges();
    expect(sfaService.navigate).toHaveBeenCalledWith('recover-email', {queryParamsHandling: 'preserve'})
  }));
  it('should redirect to verify email if the query has oobCode and mode is verifyEmail', async(() => {
    const route = getActivatedRoute({oobCode: 'abs', mode: OUT_OF_BAND_MODES.verifyEmail});
    TestBed.overrideProvider(ActivatedRoute, {useValue: route});
    authState$.next(null);
    const fixture: ComponentFixture<IndexRouteComponent> = TestBed.createComponent(IndexRouteComponent);
    const component: IndexRouteComponent = fixture.componentInstance;
    fixture.detectChanges();
    expect(sfaService.navigate).toHaveBeenCalledWith('verify-email', {queryParamsHandling: 'preserve'})
  }));


});
