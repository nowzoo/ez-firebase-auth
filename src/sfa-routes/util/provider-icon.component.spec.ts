import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderIconComponent } from './provider-icon.component';

describe('ProviderLabelComponent', () => {
  let component: ProviderIconComponent;
  let fixture: ComponentFixture<ProviderIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
