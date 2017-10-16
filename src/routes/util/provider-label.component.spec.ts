import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderLabelComponent } from './provider-label.component';

describe('ProviderLabelComponent', () => {
  let component: ProviderLabelComponent;
  let fixture: ComponentFixture<ProviderLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderLabelComponent ]
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
