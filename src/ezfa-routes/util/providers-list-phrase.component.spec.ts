import {  ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvidersListPhraseComponent } from './providers-list-phrase.component';
import { EzfaService } from '../../ezfa/ezfa.service';
describe('ProvidersListPhraseComponent', () => {
  let component: ProvidersListPhraseComponent;
  let fixture: ComponentFixture<ProvidersListPhraseComponent>;
  const sfaService = {providerLabels: {'twitter.com': 'Twitter', 'facebook.com': 'Facebook', 'github.com': 'GitHub'}};

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ProvidersListPhraseComponent ],
      providers: [
        {provide: EzfaService, useValue: sfaService}
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ProvidersListPhraseComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should set component.label if passed one id', () => {
    component.providerIds = ['twitter.com'];
    component.andOr = 'and';
    component.ngOnInit();
    expect(component.phrase).toBe('Twitter');

  });
  it('should set component.label if passed two ids', () => {
    component.providerIds = ['twitter.com', 'facebook.com'];
    component.andOr = 'and';
    component.ngOnInit();
    expect(component.phrase).toBe('Twitter and Facebook');
  });
  it('should set component.label if passed three ids', () => {
    component.providerIds = ['twitter.com', 'github.com', 'facebook.com'];
    component.andOr = 'and';
    component.ngOnInit();
    expect(component.phrase).toBe('Twitter, GitHub and Facebook');
  });
  it('should set ignore unknown ids', () => {
    component.providerIds = ['twitter.com', 'github.com', 'facebook.com', 'shsfhgfs'];
    component.andOr = 'and';
    component.ngOnInit();
    expect(component.phrase).toBe('Twitter, GitHub and Facebook');
  });
  it('should work if passed an empty array', () => {
    component.providerIds = [];
    component.andOr = 'and';
    component.ngOnInit();
    expect(component.phrase).toBe('');
  });
});
