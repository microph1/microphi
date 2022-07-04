import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TicketStore } from '../../services/tickets/ticket.store';
import { Ticket } from '../../services/tickets/ticket.interface';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketComponent {

  @Input() ticket$: BehaviorSubject<Ticket>;

  constructor(private ticketStore: TicketStore) { }

  changeStatus() {
    this.ticketStore.dispatch('changeStatus', this.ticket$.getValue());
  }
}
