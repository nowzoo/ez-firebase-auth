import { async, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms'
import { SfaService } from '../../sfa/sfa.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { PersistenceFormComponent } from './persistence-form.component';

describe('PersistenceFormComponent', () => {
  let component: PersistenceFormComponent;
  let fixture: ComponentFixture<PersistenceFormComponent>;


  const persistenceLocal$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  const authService = {
    persistenceLocal: persistenceLocal$.asObservable(),
    setPersistenceLocal: () => {}
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersistenceFormComponent ],
      imports: [ReactiveFormsModule],
      providers: [
        {provide: SfaService, useValue: authService}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersistenceFormComponent);
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
    it('should set the id', fakeAsync(() => {
      component.ngOnInit();
      expect(component.id).toBeTruthy();
    }));
    it('should update the control based on the observable', fakeAsync(() => {
      component.ngOnInit();
      expect(component.control).toBeTruthy();
      persistenceLocal$.next(false);
      tick();
      expect(component.control.value).toBe(false);
      persistenceLocal$.next(true);
      tick();
      expect(component.control.value).toBe(true);
    }));
    it('should set the persistence when the control value changes', fakeAsync(() => {
      spyOn(component.authService, 'setPersistenceLocal').and.callThrough();
      persistenceLocal$.next(true);
      component.ngOnInit();
      expect(component.authService.setPersistenceLocal).not.toHaveBeenCalled()
      expect(component.control).toBeTruthy();
      expect(component.control.value).toBe(true);
      expect(component.authService.setPersistenceLocal).not.toHaveBeenCalledWith(false)
      component.control.setValue(false);
      expect(component.authService.setPersistenceLocal).toHaveBeenCalledWith(false)
      expect(component.authService.setPersistenceLocal).not.toHaveBeenCalledWith(true)
      component.control.setValue(true);
      expect(component.authService.setPersistenceLocal).toHaveBeenCalledWith(true)
    }));
  })
});
