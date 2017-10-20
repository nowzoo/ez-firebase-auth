import { async, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { MockComponent } from 'ng2-mock-component';
import { ActivatedRoute } from '@angular/router';

import { AccountRouteComponent } from './account-route.component';

import { SfaService } from '../../sfa/sfa.service';

describe('AccountRouteComponent', () => {
  let component: AccountRouteComponent;
  let fixture: ComponentFixture<AccountRouteComponent>;

  const authState$: BehaviorSubject<any> = new BehaviorSubject(null);
  const authService = {
    authState: authState$.asObservable(),
    onRoute: () => {},
    navigate: () => {},
    getProviderById: () => Promise.resolve(provider)
  };

  const route = {snapshot: {queryParams: {}}};

  beforeEach(() => {
    spyOn(authService, 'navigate').and.callThrough();
    spyOn(authService, 'onRoute').and.callThrough();
    TestBed.configureTestingModule({
      declarations: [
        AccountRouteComponent,
        MockComponent({ selector: 'sfa-sign-in-methods', inputs: [] }),
        MockComponent({ selector: 'sfa-persistence-form', inputs: [] }),
      ],
      providers: [
        {provide: ActivatedRoute, useValue: route},
        {provide: SfaService, useValue: authService},
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(AccountRouteComponent);
    component = fixture.componentInstance;
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

  describe('ngOnInit()', () => {
    it('should call onRoute', () => {
      component.ngOnInit();
      expect(authService.onRoute).toHaveBeenCalledWith('account');
    })
    it('should set message to null if the query param is not present', () => {
      TestBed.overrideProvider(ActivatedRoute, { useValue: {snapshot: {queryParams: {}}} })
      component.ngOnInit();
      expect(component.message).toBe(null);
    })
    it('should set message if the query param is present', () => {
      component.route = {snapshot: {queryParams: {message: '234'}}}
      component.ngOnInit();
      expect(component.message).toBe('234');
    })
    it('should redirect if the user gets signed out', fakeAsync(() => {
      authState$.next({uid: 'wyy'});
      component.ngOnInit();
      tick();
      expect(authService.navigate).not.toHaveBeenCalled();
      authState$.next(null);
      expect(authService.navigate).toHaveBeenCalledWith('sign-in');
    }))
  })
});
