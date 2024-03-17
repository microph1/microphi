import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgImportComponent } from './svg-import.component';

describe('SvgImportComponent', () => {
  let component: SvgImportComponent;
  let fixture: ComponentFixture<SvgImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SvgImportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SvgImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
