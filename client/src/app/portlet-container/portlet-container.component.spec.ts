import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortletContainerComponent } from './porlet-container.component';

describe('PorletContainerComponent', () => {
  let component: PortletContainerComponent;
  let fixture: ComponentFixture<PortletContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortletContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortletContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
