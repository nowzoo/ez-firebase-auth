import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderLabelComponent } from './provider-label.component';
import { EzfaService } from '../../ezfa.service';

describe('ProviderLabelComponent', () => {
  let component: ProviderLabelComponent;
  let fixture: ComponentFixture<ProviderLabelComponent>;

  const sfaService = {providerLabels: {}};
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderLabelComponent ],
      providers: [
        {provide: EzfaService, useValue: sfaService}
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ProviderLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
