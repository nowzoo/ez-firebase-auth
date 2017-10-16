import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReauthFormComponent } from './reauth-form.component';

describe('ReauthFormComponent', () => {
  let component: ReauthFormComponent;
  let fixture: ComponentFixture<ReauthFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReauthFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReauthFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
