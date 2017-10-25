import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MockComponent } from 'ng2-mock-component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { OAuthMethod } from '../../ezfa/ezfa';
import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET
 } from '../../test';

import { AccountRouteComponent } from './account-route.component';

describe('AccountRouteComponent angular sanity check', () => {
  let component: AccountRouteComponent;
  let fixture: ComponentFixture<AccountRouteComponent>
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...MOCK_IMPORTS],
      providers: [...MOCK_PROVIDERS],
      declarations: [
        AccountRouteComponent,
        MockComponent({ selector: 'ezfa-persistence-form', inputs: [] }),
        ...MOCK_UTILITIES_DECLARATIONS
      ],
    })
    .compileComponents();
    fixture = TestBed.createComponent(AccountRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

describe('AccountRouteComponent', () => {
  let component: AccountRouteComponent;
  let authState$: BehaviorSubject<any>;
  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    const sfaService: any = Object.assign({}, MOCK_AUTH_SERVICE_GET(), {
      authState: authState$.asObservable()
    });
    const oAuthService: any =  Object.assign({}, MOCK_OAUTH_SERVICE_GET(), {});
    const route: any = MOCK_ROUTE_GET();
    component = new AccountRouteComponent(route, oAuthService, sfaService);
  });

  describe('ngOnInit()', () => {
    it ('should call onRoute', () => {
      spyOn(component.authService, 'onRoute').and.callThrough();
      component.ngOnInit();
      expect(component.authService.onRoute).toHaveBeenCalledWith('account')
    })
    it ('should call initMessage', () => {
      spyOn(component, 'initMessage').and.callThrough();
      component.ngOnInit();
      expect(component.initMessage).toHaveBeenCalledWith()
    })
    it ('should gate to signed in users', fakeAsync(() => {
      spyOn(component, 'onInitLoadUser').and.callThrough();
      spyOn(component, 'gateToSignedInUser').and.callThrough();
      component.ngOnInit();
      expect(component.onInitLoadUser).toHaveBeenCalledWith();
      tick();
      expect(component.gateToSignedInUser).toHaveBeenCalledWith()
    }));

  })
  describe('initMessage()', () => {
    it('should deal if there is no message', () => {
      component.route.snapshot.queryParams = {};
      component.initMessage();
      expect(component.message).toBe(null);
    })
    it('should deal if the message is not an int', () => {
      component.route.snapshot.queryParams = {message: 'agshsg'};
      component.initMessage();
      expect(component.message).toBe(null);
    })
    it('should convert to an int', () => {
      component.route.snapshot.queryParams = {message: '1'};
      component.initMessage();
      expect(component.message).toBe(1);
    })
  })

  describe('addProvider(providerId)', () => {
    it('should work for password', () => {
      spyOn(component.authService, 'navigate').and.callFake(() => {});
      component.addProvider('password');
      expect(component.authService.navigate).toHaveBeenCalledWith('add-password')
    })
    it('should work for twitter.com if the method is popup', () => {
      component.user = MOCK_USER;
      const p = new Promise<any>(() => {});
      spyOn(component.authService, 'navigate').and.callFake(() => {});
      spyOn(component.oAuthService, 'linkWithPopup').and.callFake(() => p);
      component.authService.oAuthMethod = OAuthMethod.popup;
      component.addProvider('twitter.com');
      expect(component.oAuthService.linkWithPopup).toHaveBeenCalledWith('twitter.com', MOCK_USER);
      expect(component.oAuthService.savedPopupPromise).toBe(p);
      expect(component.authService.navigate).toHaveBeenCalledWith('link', {queryParams: {providerId: 'twitter.com'}})
    })
    it('should work for twitter.com if the method is redirect', () => {
      spyOn(component.authService, 'navigate').and.callFake(() => {});
      component.authService.oAuthMethod = OAuthMethod.redirect;
      component.addProvider('twitter.com');
      expect(component.authService.navigate).toHaveBeenCalledWith('link', {queryParams: {providerId: 'twitter.com'}})
    })
  })
})
