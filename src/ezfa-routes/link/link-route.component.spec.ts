import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as firebase from 'firebase';
import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET,
  MOCK_USER_INFO_PASSWORD,
  MOCK_USER_INFO_GITHUB,
  MOCK_USER_INFO_GOOGLE,
  MOCK_USER_INFO_TWITTER,
  MOCK_USER_INFO_FACEBOOK,
  MOCK_ERROR
 } from '../../test';


import { OAuthMethod, IAuthUserEvent } from '../../ezfa/ezfa';
import { LinkRouteComponent } from './link-route.component';
import { SfaMessages } from '../messages.enum';

describe('LinkRouteComponent angular sanity check', () => {
  let component: LinkRouteComponent;
  let fixture: ComponentFixture<LinkRouteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...MOCK_IMPORTS],
      declarations: [
        LinkRouteComponent,
        ...MOCK_UTILITIES_DECLARATIONS
       ],
      providers: [
        ...MOCK_PROVIDERS
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(LinkRouteComponent);
    component = fixture.componentInstance as LinkRouteComponent;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

});
describe('LinkRouteComponent', () => {
  let component;
  let authState$: BehaviorSubject<any>;

  beforeEach(() => {
    authState$ = new BehaviorSubject(null);
    const sfaService: any = Object.assign({}, MOCK_AUTH_SERVICE_GET(), {
      authState: authState$.asObservable(),
      configuredProviderIds: ['password', 'twitter.com', 'facebook.com', 'google.com', 'github.com'],
      oAuthProviderIds: ['twitter.com', 'facebook.com', 'google.com', 'github.com']
    });
    const route: any = Object.assign({}, MOCK_ROUTE_GET());
    route.snapshot.queryParams.providerId = 'twitter.com';
    const oAuthService: any = Object.assign({}, MOCK_OAUTH_SERVICE_GET());
    component = new LinkRouteComponent(route, oAuthService, sfaService);
  });
  it('should have an ngUnsubscribe', () => {
    expect(component.ngUnsubscribe).toBeTruthy()
  })
  it('should have an authService', () => {
    expect(component.authService).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should call onRoute', () => {
      spyOn(component.authService, 'onRoute').and.callThrough();
      component.ngOnInit();
      expect(component.authService.onRoute).toHaveBeenCalledWith('link');
    })
    it('should navigate away if providerId is not present in the params', () => {
      component.route.snapshot.queryParams = {};
      spyOn(component.authService, 'navigate').and.callThrough();
      component.ngOnInit();
      expect(component.authService.navigate).toHaveBeenCalledWith();
    });
    it ('should handle the case when there is a saved popup promise', fakeAsync(() => {
      spyOn(component, 'gateToSignedInUser').and.callFake(() => Promise.resolve());
      spyOn(component, 'onInitLoadUser').and.callFake(() => Promise.resolve());
      spyOn(component, 'onInitHandleSavedPopupPromise').and.callFake(() => Promise.resolve(true));
      spyOn(component, 'onInitCheckForRedirect').and.callThrough();
      spyOn(component, 'link').and.callFake(() => {});
      component.ngOnInit();
      expect(component.onInitLoadUser).toHaveBeenCalled();
      tick();
      expect(component.onInitHandleSavedPopupPromise).toHaveBeenCalled();
      tick();
      expect(component.onInitCheckForRedirect).not.toHaveBeenCalled();
      tick();
      expect(component.link).not.toHaveBeenCalled();
      expect(component.gateToSignedInUser).toHaveBeenCalled();
    }))
    it ('should handle the case when there is a redirect', fakeAsync(() => {
      spyOn(component, 'gateToSignedInUser').and.callFake(() => Promise.resolve());
      spyOn(component, 'onInitLoadUser').and.callFake(() => Promise.resolve());
      spyOn(component, 'onInitHandleSavedPopupPromise').and.callFake(() => Promise.resolve(false));
      spyOn(component, 'onInitCheckForRedirect').and.callFake(() => Promise.resolve(true));
      spyOn(component, 'link').and.callFake(() => {});
      component.ngOnInit();
      expect(component.onInitLoadUser).toHaveBeenCalled();
      tick();
      expect(component.onInitHandleSavedPopupPromise).toHaveBeenCalled();
      tick();
      expect(component.onInitCheckForRedirect).toHaveBeenCalled();
      tick();
      expect(component.link).not.toHaveBeenCalled();
      expect(component.gateToSignedInUser).toHaveBeenCalled();

    }))
    it ('should handle the case when there is neither a popup promise nor a redirect result', fakeAsync(() => {
      spyOn(component, 'gateToSignedInUser').and.callFake(() => Promise.resolve());
      spyOn(component, 'onInitLoadUser').and.callFake(() => Promise.resolve());
      spyOn(component, 'onInitHandleSavedPopupPromise').and.callFake(() => Promise.resolve(false));
      spyOn(component, 'onInitCheckForRedirect').and.callFake(() => Promise.resolve(false));
      spyOn(component, 'link').and.callFake(() => {});
      component.ngOnInit();
      expect(component.onInitLoadUser).toHaveBeenCalled();
      tick();
      expect(component.onInitHandleSavedPopupPromise).toHaveBeenCalled();
      tick();
      expect(component.onInitCheckForRedirect).toHaveBeenCalled();
      tick();
      expect(component.link).toHaveBeenCalled();
      expect(component.gateToSignedInUser).toHaveBeenCalled();
    }))
  })


  describe('onLinkError()', () => {
    it('should set props', () => {
      const err = Object.assign({}, MOCK_ERROR)
      component.onLinkError(err);
      expect(component.error).toBe(err);
      expect(component.success).toBe(null)
      expect(component.wait).toBe(false)
    })
  })

  describe('onLinkSuccess(event: IAuthUserEvent)', () => {
    it('should set props and redirect', () => {
      spyOn(component.authService, 'navigate').and.callThrough();
      const event: IAuthUserEvent = {
        user: Object.assign({}, MOCK_USER),
        providerId: 'twitter.com'
      };
      component.onLinkSuccess(event);
      expect(component.error).toBe(null);
      expect(component.success).toBe(event);
      expect(component.wait).toBe(false);
      expect(component.authService.navigate).toHaveBeenCalledWith('account', {queryParams: {message: SfaMessages.twitterAccountAdded}})
    })
    it('should redirect with correct msg for facebook', () => {
      spyOn(component.authService, 'navigate').and.callThrough();
      const event: IAuthUserEvent = {
        user: Object.assign({}, MOCK_USER),
        providerId: 'facebook.com'
      };
      component.onLinkSuccess(event);
      expect(component.authService.navigate).toHaveBeenCalledWith('account', {queryParams: {message: SfaMessages.facebookAccountAdded}})
    })
    it('should redirect with correct msg for google', () => {
      spyOn(component.authService, 'navigate').and.callThrough();
      const event: IAuthUserEvent = {
        user: Object.assign({}, MOCK_USER),
        providerId: 'google.com'
      };
      component.onLinkSuccess(event);
      expect(component.authService.navigate).toHaveBeenCalledWith('account', {queryParams: {message: SfaMessages.googleAccountAdded}})
    })
    it('should redirect with correct msg for gh', () => {
      spyOn(component.authService, 'navigate').and.callThrough();
      const event: IAuthUserEvent = {
        user: Object.assign({}, MOCK_USER),
        providerId: 'github.com'
      };
      component.onLinkSuccess(event);
      expect(component.authService.navigate).toHaveBeenCalledWith('account', {queryParams: {message: SfaMessages.githubAccountAdded}})
    })
  })



  describe('link', () => {
    it('should handle things if the redirect call fails', fakeAsync(() => {
      component.authService.oAuthMethod = OAuthMethod.redirect;
      spyOn(component.oAuthService, 'linkWithRedirect').and.callFake(() => Promise.reject(MOCK_ERROR));
      spyOn(component, 'onLinkSuccess').and.callThrough();
      spyOn(component, 'onLinkError').and.callThrough();
      component.providerId = 'twitter.com';
      component.user = MOCK_USER;
      component.link();
      expect(component.onLinkSuccess).not.toHaveBeenCalled();
      expect(component.onLinkError).not.toHaveBeenCalled();
      expect(component.wait).toBe(true);
      tick();
      expect(component.onLinkError).toHaveBeenCalledWith(MOCK_ERROR);
    }));
    it('should handle things if the popup call fails', fakeAsync(() => {
      component.authService.oAuthMethod = OAuthMethod.popup;
      spyOn(component.oAuthService, 'linkWithPopup').and.callFake(() => Promise.reject(MOCK_ERROR));
      spyOn(component, 'onLinkSuccess').and.callThrough();
      spyOn(component, 'onLinkError').and.callThrough();
      component.providerId = 'twitter.com';
      component.user = MOCK_USER;
      component.link();
      expect(component.onLinkSuccess).not.toHaveBeenCalled();
      expect(component.onLinkError).not.toHaveBeenCalled();
      expect(component.wait).toBe(true);
      tick();
      expect(component.onLinkError).toHaveBeenCalledWith(MOCK_ERROR);
    }));
    it('should handle things if the popup call succeeds', fakeAsync(() => {
      component.authService.oAuthMethod = OAuthMethod.popup;
      const event: IAuthUserEvent = {
        user: Object.assign({}, MOCK_USER),
        providerId: 'twitter.com'
      };
      spyOn(component.oAuthService, 'linkWithPopup').and.callFake(() => Promise.resolve(event));
      spyOn(component, 'onLinkSuccess').and.callThrough();
      spyOn(component, 'onLinkError').and.callThrough();
      component.providerId = 'twitter.com';
      component.user = MOCK_USER;
      component.link();
      expect(component.onLinkSuccess).not.toHaveBeenCalled();
      expect(component.onLinkError).not.toHaveBeenCalled();
      expect(component.wait).toBe(true);
      tick();
      expect(component.onLinkSuccess).toHaveBeenCalledWith(event);
    }));
  });
  describe('onInitHandleSavedPopupPromise', () => {
    it('should resolve with true and redirect if the user is not signed in', fakeAsync(() => {
      let resolved;
      spyOn(component.authService, 'navigate').and.callThrough();
      component.user = null;
      component.onInitHandleSavedPopupPromise().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.authService.navigate).toHaveBeenCalledWith()
    }));
    it('should resolve with false if no promise has been saved', fakeAsync(() => {
      let resolved;
      component.user = MOCK_USER;
      spyOn(component, 'onLinkSuccess').and.callThrough();
      spyOn(component, 'onLinkError').and.callThrough();
      component.oAuthService.savedPopupPromise = null;
      component.onInitHandleSavedPopupPromise().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false);
      expect(component.onLinkSuccess).not.toHaveBeenCalled();
      expect(component.onLinkError).not.toHaveBeenCalled();
    }));
    it('should always set the saved fromise to null', fakeAsync(() => {
      const p = new Promise(resolve => {
        resolve();
      })
      component.oAuthService.savedPopupPromise = p;
      component.onInitHandleSavedPopupPromise();
      expect(component.oAuthService.savedPopupPromise).toBe(null);
    }));
    it('should resolve with false if there is a promise but it does not return an event', fakeAsync(() => {
      let resolved;
      component.user = MOCK_USER;
      const event: IAuthUserEvent = {
        user: Object.assign({}, MOCK_USER),
        providerId: 'twitter.com'
      };
      const p = new Promise(resolve => {
        resolve(null);
      })
      spyOn(component, 'onLinkSuccess').and.callThrough();
      spyOn(component, 'onLinkError').and.callThrough();
      component.oAuthService.savedPopupPromise = p;
      component.onInitHandleSavedPopupPromise().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false);
      expect(component.onLinkSuccess).not.toHaveBeenCalled();
      expect(component.onLinkError).not.toHaveBeenCalled();
    }));
    it('should resolve with true if there is a promise and it is successful', fakeAsync(() => {
      let resolved;
      component.user = MOCK_USER;
      const event: IAuthUserEvent = {
        user: Object.assign({}, MOCK_USER),
        providerId: 'twitter.com'
      };
      const p = new Promise(resolve => {
        resolve(event);
      })
      spyOn(component, 'onLinkSuccess').and.callThrough();
      spyOn(component, 'onLinkError').and.callThrough();
      component.oAuthService.savedPopupPromise = p;
      component.onInitHandleSavedPopupPromise().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.onLinkSuccess).toHaveBeenCalledWith(event);
      expect(component.onLinkError).not.toHaveBeenCalled();
    }));
    it('should resolve with true if there is a promise and it fails', fakeAsync(() => {
      let resolved;
      component.user = MOCK_USER;
      const p = new Promise((resolve, reject) => {
        reject(MOCK_ERROR);
      })
      spyOn(component, 'onLinkSuccess').and.callThrough();
      spyOn(component, 'onLinkError').and.callThrough();
      component.oAuthService.savedPopupPromise = p;
      component.onInitHandleSavedPopupPromise().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.onLinkSuccess).not.toHaveBeenCalled();
      expect(component.onLinkError).toHaveBeenCalledWith(MOCK_ERROR);
    }));
  })

  describe('onInitCheckForRedirect', () => {
    it('should resolve with true and redirect if the user is not signed in', fakeAsync(() => {
      let resolved;
      spyOn(component.authService, 'navigate').and.callThrough();
      component.user = null;
      component.onInitCheckForRedirect().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.authService.navigate).toHaveBeenCalledWith()
    }));
    it('should resolve with true if there is a redirect', fakeAsync(() => {
      let resolved;
      const event: IAuthUserEvent = {
        user: MOCK_USER,
        providerId: 'twitter.com'
      };
      component.user = MOCK_USER;
      spyOn(component.oAuthService, 'checkForLinkRedirect').and.callFake(() => Promise.resolve(event))
      spyOn(component, 'onLinkSuccess').and.callThrough();
      component.onInitCheckForRedirect().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.onLinkSuccess).toHaveBeenCalledWith(event)
    }));
    it('should resolve with false if there is no redirect', fakeAsync(() => {
      let resolved;
      component.user = MOCK_USER;
      spyOn(component.oAuthService, 'checkForLinkRedirect').and.callFake(() => Promise.resolve(null))
      spyOn(component, 'onLinkSuccess').and.callThrough();
      component.onInitCheckForRedirect().then(result => resolved = result);
      tick();
      expect(resolved).toBe(false);
      expect(component.onLinkSuccess).not.toHaveBeenCalled()
    }));
    it('should resolve with true if there is a redirect but an error', fakeAsync(() => {
      let resolved;
      component.user = MOCK_USER;
      spyOn(component.oAuthService, 'checkForLinkRedirect').and.callFake(() => Promise.reject(MOCK_ERROR))
      spyOn(component, 'onLinkError').and.callThrough();
      component.onInitCheckForRedirect().then(result => resolved = result);
      tick();
      expect(resolved).toBe(true);
      expect(component.onLinkError).toHaveBeenCalledWith(MOCK_ERROR)
    }));
  });
})
