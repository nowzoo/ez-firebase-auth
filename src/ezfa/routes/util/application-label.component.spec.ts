import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationLabelComponent } from './application-label.component';
import { EzfaService } from '../../ezfa.service';
describe('ApplicationLabelComponent', () => {
  let component: ApplicationLabelComponent;
  let fixture: ComponentFixture<ApplicationLabelComponent>;
  const sfaService = {applicationLabel: 'Foo Bar'};
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationLabelComponent ],
      providers: [
        {provide: EzfaService, useValue: sfaService}
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ApplicationLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should set component.label', () => {
    expect(component.label).toBe('Foo Bar');
  });
});
