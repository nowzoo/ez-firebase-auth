import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderLabelComponent } from './provider-label.component';
import { SfaService } from '../../sfa/sfa.service';

describe('ProviderLabelComponent', () => {
  let component: ProviderLabelComponent;
  let fixture: ComponentFixture<ProviderLabelComponent>;

  const sfaService = {providerLabels: {}}
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderLabelComponent ],
      providers: [
        {provide: SfaService, useValue: sfaService}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
