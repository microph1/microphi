import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoChangeDetectionComponent } from './demo-change-detection.component';
import { ItemsStore } from './items-store';

xdescribe('DemoChangeDetectionComponent', () => {
  let component: DemoChangeDetectionComponent;
  let fixture: ComponentFixture<DemoChangeDetectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DemoChangeDetectionComponent],
      providers: [
        ItemsStore,
      ]
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
