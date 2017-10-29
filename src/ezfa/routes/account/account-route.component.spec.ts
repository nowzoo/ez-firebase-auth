import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MockComponent } from 'ng2-mock-component';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { EzfaService } from '../../ezfa.service';
import { EzfaOauthMethod } from '../../ezfa-oauth-method.enum';
import * as TEST_HELPERS from '../../test';
import { Messages } from '../messages.enum';
import { AccountRouteComponent } from './account-route.component';

describe('AccountRouteComponent', () => {
  let component: AccountRouteComponent;
  let fixture: ComponentFixture<AccountRouteComponent>;
  let route;
  beforeEach(() => {
    route = TEST_HELPERS.getMockActivatedRoute();
    TestBed.configureTestingModule({
      imports: [...TEST_HELPERS.MOCK_IMPORTS],
      providers: [
        {provide: EzfaService, useValue: TEST_HELPERS.getMockService()},
        {provide: ActivatedRoute, useValue: route}
      ],
      declarations: [
        AccountRouteComponent,
        MockComponent({ selector: 'ezfa-persistence-form', inputs: [] }),
        ...TEST_HELPERS.MOCK_UTILITIES_DECLARATIONS
      ],
    })
    .compileComponents();
    fixture = TestBed.createComponent(AccountRouteComponent);
    component = fixture.componentInstance;
  });
  it('should be created', () => {
    expect(component).toBeTruthy();
  });
  describe('initMessage()', () => {
    it('should initialize properly if there is a message', () => {
      component.route.snapshot.queryParams.message = '34';
      component.initMessage();
      expect(component.message).toBe(34);
    });
    it('should initialize properly if there is a messed up message', () => {
      component.route.snapshot.queryParams.message = 'foobar';
      component.initMessage();
      expect(component.message).toBe(null);
    });
    it('should initialize properly if there is no message', () => {
      delete component.route.snapshot.queryParams.message;
      component.initMessage();
      expect(component.message).toBe(null);
    });
  });

  describe('addProvider', () => {
    let provider;
    let getProviderByIdSpy;
    let user;
    let popupSpy;
    beforeEach(() => {
      user = Object.assign({}, TEST_HELPERS.MOCK_USER);
      provider = {provider: 'twitter.com'};
      component.user = user;
      popupSpy = spyOn(user, 'linkWithPopup').and.callFake(() => Promise.resolve(TEST_HELPERS.MOCK_USER_CRED));
      spyOn(component.service, 'navigate').and.callThrough();
      getProviderByIdSpy = spyOn(component.service, 'getProviderById').and.callFake(() => Promise.resolve(provider));
    });
    it('should handle password', () => {
      component.addProvider('password');
      expect(component.service.navigate).toHaveBeenCalledWith('add-password');
    });
    it('should handle oauth when the method is redirect' , fakeAsync(() => {
      component.service.oauthMethod = EzfaOauthMethod.redirect;
      component.addProvider('twitter.com');
      tick();
      expect(component.service.navigate).toHaveBeenCalledWith('link', {queryParams: {providerId: 'twitter.com'}});
    }));
    it('should handle oauth when the method is popup' , fakeAsync(() => {
      component.service.oauthMethod = EzfaOauthMethod.popup;
      component.addProvider('twitter.com');
      tick();
      expect(component.service.navigate).toHaveBeenCalledWith('link', {queryParams: {providerId: 'twitter.com'}});
      expect(popupSpy).toHaveBeenCalledWith(provider);
    }));
  });

  describe('ngOnInit()', () => {
    it('should call service.onRouteChange', () => {
      spyOn(component.service, 'onRouteChange').and.callThrough();
      component.ngOnInit();
      expect(component.service.onRouteChange).toHaveBeenCalledWith('account');
    });
    it('should call this.initMessage', () => {
      spyOn(component, 'initMessage').and.callFake(() => {});
      component.ngOnInit();
      expect(component.initMessage).toHaveBeenCalledWith();
    });
    it('should gate to signed in user', fakeAsync(() => {
      spyOn(component, 'gateToSignedInUser').and.callFake(() => {});
      component.ngOnInit();
      tick();
      expect(component.gateToSignedInUser).toHaveBeenCalledWith();
    }));
  });
});
