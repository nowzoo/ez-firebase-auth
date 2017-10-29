import { ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { EzfaService } from '../../ezfa.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { PersistenceFormComponent } from './persistence-form.component';
import * as HELPER from '../../test';

describe('PersistenceFormComponent', () => {
  let component: PersistenceFormComponent;
  let fixture: ComponentFixture<PersistenceFormComponent>;
  let authState$: BehaviorSubject<any>;
  let service;
  let localPersistenceEnabled$;
  beforeEach(() => {
    localPersistenceEnabled$ = new BehaviorSubject(true);
    authState$ = new BehaviorSubject(null);
    service = HELPER.getMockService(authState$, localPersistenceEnabled$);
    TestBed.configureTestingModule({
      declarations: [ PersistenceFormComponent, ...HELPER.MOCK_UTILITIES_DECLARATIONS ],
      imports: [...HELPER.MOCK_IMPORTS],
      providers: [
        {provide: EzfaService, useValue: service}
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(PersistenceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });



  describe('ngOnInit()', () => {
    it('should set the id', fakeAsync(() => {
      component.ngOnInit();
      expect(component.id).toBeTruthy();
    }));
    it('should update the control based on the observable', fakeAsync(() => {
      localPersistenceEnabled$.next(false);
      component.ngOnInit();
      expect(component.control).toBeTruthy();
      tick();
      expect(component.control.value).toBe(false);
    }));
    it('should update the control based on the observable', fakeAsync(() => {
      localPersistenceEnabled$.next(true);
      component.ngOnInit();
      expect(component.control).toBeTruthy();
      tick();
      expect(component.control.value).toBe(true);
    }));
    it('should set the persistence when the control value changes', fakeAsync(() => {
      spyOn(component.service, 'setPersistenceLocal').and.callThrough();
      component.ngOnInit();
      expect(component.service.setPersistenceLocal).not.toHaveBeenCalled();
      expect(component.control).toBeTruthy();
      expect(component.control.value).toBe(true);
      expect(component.service.setPersistenceLocal).not.toHaveBeenCalledWith(false);
      component.control.setValue(false);
      expect(component.service.setPersistenceLocal).toHaveBeenCalledWith(false);
      expect(component.service.setPersistenceLocal).not.toHaveBeenCalledWith(true);
      component.control.setValue(true);
      expect(component.service.setPersistenceLocal).toHaveBeenCalledWith(true);
    }));
  });
});
