import { Input, Directive } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MockComponent } from 'ng2-mock-component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SignInMethodsComponent } from './sign-in-methods.component';
import { SfaService } from '../../sfa/sfa.service';
import { OAuthMethod } from '../../sfa/sfa';
import { OauthService } from '../oauth.service';

@Directive({
  selector: '[sfaProviderTitle]'
})
class MockProviderTitleDirective implements OnInit {
  @Input() public sfaProviderTitle: {label: string, id: string};
}
describe('SignInMethodsComponent', () => {

  const user = {
    email: 'foo@bar.com',
    providerData: [{providerId: 'twitter.com'}],
    linkWithCredential: () => Promise.resolve(),
    reload: () => Promise.resolve()
  }
  const authState$: BehaviorSubject<any> = new BehaviorSubject(user);
  const authService = {
    authState: authState$.asObservable(),
    configuredProviderIds: [],
    oAuthProviderIds: [],
    navigate: () => {},
    oAuthMethod: OAuthMethod.popup
  };

  const oAuthService = {
    linkWithPopup: () => {},
  };
  let component: SignInMethodsComponent;
  let fixture: ComponentFixture<SignInMethodsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        SignInMethodsComponent,
        MockProviderTitleDirective,
        MockComponent({ selector: 'sfa-provider-icon', inputs: ['providerId'] }),
        MockComponent({ selector: 'sfa-provider-label', inputs: ['providerId'] }),
      ],
      providers: [
        {provide: SfaService, useValue: authService},
        {provide: OauthService, useValue: oAuthService}
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(SignInMethodsComponent);
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
    it('should call subscribe to authState and updateProviderIds', fakeAsync(() => {
      spyOn(component, 'updateProviderIds').and.callFake(() => {})
      authState$.next(user);
      component.ngOnInit();
      tick();
      expect(component.updateProviderIds).toHaveBeenCalledWith(user, [], []);
    }))
    it('should deal with a null user', fakeAsync(() => {
      spyOn(component, 'updateProviderIds').and.callFake(() => {})
      authState$.next(null);
      component.ngOnInit();
      tick();
      expect(component.updateProviderIds).not.toHaveBeenCalled();
      expect(component.userProviderIds).toEqual([])
      expect(component.userOAuthProviderIds).toEqual([])
      expect(component.availableOAuthProviderIds).toEqual([])
      expect(component.userHasEmailProvider).toEqual(false)
      expect(component.emailProviderAvailable).toEqual(false)
    }))

  })

  describe('updateProviderIds(user, configuredProviderIds, oAuthProviderIds)', () => {
    it('should work', fakeAsync(() => {
      const myUser = {providerData: [{providerId: 'password'}], reload: () => Promise.resolve()}
      let cfgIds = ['password'];
      let oauthIds = [];
      component.updateProviderIds(myUser, cfgIds, oauthIds);
      tick();
      expect(component.userProviderIds).toEqual(['password']);
      expect(component.userOAuthProviderIds).toEqual([]);
      expect(component.availableOAuthProviderIds).toEqual([]);
      expect(component.userHasEmailProvider).toEqual(true);
      expect(component.emailProviderAvailable).toEqual(false);
      cfgIds = ['password', 'twitter.com'];
      oauthIds = ['twitter.com'];
      component.updateProviderIds(myUser, cfgIds, oauthIds);
      tick();
      expect(component.userProviderIds).toEqual(['password']);
      expect(component.userOAuthProviderIds).toEqual([]);
      expect(component.availableOAuthProviderIds).toEqual(['twitter.com']);
      expect(component.userHasEmailProvider).toEqual(true);
      expect(component.emailProviderAvailable).toEqual(false);
      myUser.providerData = [{providerId: 'twitter.com'}];
      cfgIds = ['password', 'twitter.com', 'facebook.com'];
      oauthIds = ['twitter.com', 'facebook.com'];
      component.updateProviderIds(myUser, cfgIds, oauthIds);
      tick();
      expect(component.userProviderIds).toEqual(['twitter.com']);
      expect(component.userOAuthProviderIds).toEqual(['twitter.com']);
      expect(component.availableOAuthProviderIds).toEqual(['facebook.com']);
      expect(component.userHasEmailProvider).toEqual(false);
      expect(component.emailProviderAvailable).toEqual(true);
    }))
  })

  describe('link(providerId)', () => {
    it('should work for password', () => {
      spyOn(component.authService, 'navigate').and.callFake(() => {});
      component.link('password');
      expect(component.authService.navigate).toHaveBeenCalledWith('add-password')
    })
    it('should work for twitter.com if the method is popup', () => {
      component.user = user;
      const p = new Promise();
      spyOn(component.authService, 'navigate').and.callFake(() => {});
      spyOn(component.oAuthService, 'linkWithPopup').and.callFake(() => p);
      component.authService.oAuthMethod = OAuthMethod.popup;
      component.link('twitter.com');
      expect(component.oAuthService.linkWithPopup).toHaveBeenCalledWith('twitter.com', user);
      expect(component.oAuthService.savedPopupPromise).toBe(p);
      expect(component.authService.navigate).toHaveBeenCalledWith('link', {queryParams: {providerId: 'twitter.com'}})
    })
    it('should work for twitter.com if the method is redirect', () => {
      spyOn(component.authService, 'navigate').and.callFake(() => {});
      component.authService.oAuthMethod = OAuthMethod.link;
      component.link('twitter.com');
      expect(component.authService.navigate).toHaveBeenCalledWith('link', {queryParams: {providerId: 'twitter.com'}})
    })
  })
});
