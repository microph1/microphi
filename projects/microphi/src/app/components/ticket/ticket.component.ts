import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TicketActions, TicketStore } from '../../services/tickets/ticket.store';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketComponent implements OnInit {

  @Input() ticket: BehaviorSubject<any>;

  constructor(private ticketStore: TicketStore) { }

  ngOnInit() {
  }

  changeStatus() {
    this.ticketStore.dispatch(TicketActions.CHANGE_STATUS, this.ticket.getValue());
  }
}
