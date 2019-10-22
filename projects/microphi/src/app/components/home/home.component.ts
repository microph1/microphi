import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Log } from '@microgamma/loggator';
import { AuthStore } from '../../services/auth/auth.store';
import { TicketActions, TicketStore } from '../../services/tickets/ticket.store';
import { Ticket } from '../../services/tickets/ticket.interface';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  @Log()
  private $log;

  public user$ = this.authStore.user$;

  public tickets$ = this.ticketStore.tickets$;
  public loadingTickets = false;

  constructor(private authStore: AuthStore, private ticketStore: TicketStore) {
    this.ticketStore.loading$.pipe(
      filter((event) => {

        return event.type.includes(TicketActions[TicketActions.FIND_ALL]);
      })
    ).subscribe((status) => {

      // we can't use an async pipe for this as it would subscribe to the observable after ngOnInit hence we miss
      // the loading start event;
      this.loadingTickets = status.status;

    });
  }

  public ngOnInit(): void {
    this.ticketStore.dispatch(TicketActions.FIND_ALL);
  }

  public changeStatus(i: Ticket) {
    this.ticketStore.dispatch(TicketActions.CHANGE_STATUS, i);
  }

  public assign(ticket, user) {
    this.ticketStore.dispatch(TicketActions.ASSIGN, {ticket, user});
  }
}
