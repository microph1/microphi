import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ToolbarComponent } from './toolbar.component';
import { MaterialModule } from '../../material.module';
import { AuthStore } from '../../services/auth/auth.store';
import { AuthService } from '../../services/auth/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule, HttpClientTestingModule],
      declarations: [ToolbarComponent],
      providers: [
        AuthStore, AuthService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
