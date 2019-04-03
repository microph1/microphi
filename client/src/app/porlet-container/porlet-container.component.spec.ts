import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PorletContainerComponent } from './porlet-container.component';

describe('PorletContainerComponent', () => {
  let component: PorletContainerComponent;
  let fixture: ComponentFixture<PorletContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PorletContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PorletContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
