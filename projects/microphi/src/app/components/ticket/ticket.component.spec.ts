import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketComponent } from './ticket.component';
import { MaterialModule } from '../../material.module';
import { TicketStore } from '../../services/tickets/ticket.store';
import { BackendService } from '../../services/tickets/ticket.service';

describe('TicketComponent', () => {
  let component: TicketComponent;
  let fixture: ComponentFixture<TicketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule],
      declarations: [TicketComponent],
      providers: [
        TicketStore,
        BackendService
      ]

    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
