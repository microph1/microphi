import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgCatComponent } from './ng-cat.component';

describe('NgCatComponent', () => {
  let component: NgCatComponent;
  let fixture: ComponentFixture<NgCatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgCatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgCatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
