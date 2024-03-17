import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakersToolbarComponent } from './speakers-toolbar.component';

describe('SpearkersToolbarComponent', () => {
  let component: SpeakersToolbarComponent;
  let fixture: ComponentFixture<SpeakersToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpeakersToolbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeakersToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
