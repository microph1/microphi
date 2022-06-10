import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { MaterialModule } from '../../material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TicketComponent } from '../ticket/ticket.component';
import { IsLoggedInPipe } from '../../pipes/is-logged-in.pipe';
import { AuthStore } from '../../services/auth/auth.store';
import { AuthService } from '../../services/auth/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TicketStore } from '../../services/tickets/ticket.store';
import { BackendService } from '../../services/tickets/ticket.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule, ReactiveFormsModule, HttpClientTestingModule, NoopAnimationsModule],
      declarations: [HomeComponent, TicketComponent, IsLoggedInPipe],
      providers: [AuthStore, AuthService, TicketStore, BackendService]


    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
