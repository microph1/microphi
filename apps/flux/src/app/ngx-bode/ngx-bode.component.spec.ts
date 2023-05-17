import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxBodeComponent } from './ngx-bode.component';

describe('NgxBodeComponent', () => {
  let component: NgxBodeComponent;
  let fixture: ComponentFixture<NgxBodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxBodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxBodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
