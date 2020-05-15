import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoChangeDetectionComponent } from './demo-change-detection.component';

describe('DemoChangeDetectionComponent', () => {
  let component: DemoChangeDetectionComponent;
  let fixture: ComponentFixture<DemoChangeDetectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoChangeDetectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoChangeDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
