import { ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms'
import { EzfaService } from '../../ezfa/ezfa.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { PersistenceFormComponent } from './persistence-form.component';
import {
  MOCK_UTILITIES_DECLARATIONS,
  MOCK_IMPORTS,
  MOCK_PROVIDERS,
  MOCK_ROUTE_GET,
  MOCK_USER,
  MOCK_AUTH_SERVICE_GET,
  MOCK_OAUTH_SERVICE_GET
 } from '../../test';

describe('PersistenceFormComponent angular sanity check', () => {
  let component: PersistenceFormComponent;
  let fixture: ComponentFixture<PersistenceFormComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ PersistenceFormComponent, ...MOCK_UTILITIES_DECLARATIONS ],
      imports: [...MOCK_IMPORTS],
      providers: [
        ...MOCK_PROVIDERS
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
});

describe('PersistenceFormComponent', () => {
  let component;
  let persistenceLocal$: BehaviorSubject<any>;
  beforeEach(() => {
    persistenceLocal$ = new BehaviorSubject(true);
    const sfaService: any = Object.assign({}, MOCK_AUTH_SERVICE_GET(), {
      persistenceLocal: persistenceLocal$.asObservable()
    });
    component = new PersistenceFormComponent(sfaService);
  });


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
