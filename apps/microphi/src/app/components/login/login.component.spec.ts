import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../material.module';
import { AuthStore } from '../../services/auth/auth.store';
import { AuthService } from '../../services/auth/auth.service';
import { MockComponent } from '@microphi/test';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, NoopAnimationsModule],
      declarations: [
        LoginComponent,
        MockComponent({
          selector: 'phi-login'
        })
      ],
      providers: [AuthStore, AuthService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
