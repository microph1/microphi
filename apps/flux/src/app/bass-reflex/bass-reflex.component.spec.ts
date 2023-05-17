import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BassReflexComponent } from './bass-reflex.component';

describe('BassReflexComponent', () => {
  let component: BassReflexComponent;
  let fixture: ComponentFixture<BassReflexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BassReflexComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BassReflexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
