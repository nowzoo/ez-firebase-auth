import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconWaitComponent } from './icon-wait.component';

describe('IconWaitComponent', () => {
  let component: IconWaitComponent;
  let fixture: ComponentFixture<IconWaitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ IconWaitComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(IconWaitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
