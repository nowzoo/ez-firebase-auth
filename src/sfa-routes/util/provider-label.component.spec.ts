import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderLabelComponent } from './provider-label.component';
import { SfaService } from '../../sfa/sfa.service';

describe('ProviderLabelComponent', () => {
  let component: ProviderLabelComponent;
  let fixture: ComponentFixture<ProviderLabelComponent>;

  const sfaService = {providerLabels: {}}
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderLabelComponent ],
      providers: [
        {provide: SfaService, useValue: sfaService}
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
