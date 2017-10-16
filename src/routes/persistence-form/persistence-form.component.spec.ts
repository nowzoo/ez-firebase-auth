import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersistenceFormComponent } from './persistence-form.component';

describe('PersistenceFormComponent', () => {
  let component: PersistenceFormComponent;
  let fixture: ComponentFixture<PersistenceFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersistenceFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersistenceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
