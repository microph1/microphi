import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Log } from '@microgamma/loggator';
import { AuthStore } from '../../services/auth/auth.store';
import { TicketActions, TicketStore } from '../../services/tickets/ticket.store';
import { Ticket } from '../../services/tickets/ticket.interface';
import { debounce, debounceTime, filter, map, mergeMap, multicast, tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, combineLatest, of } from 'rxjs';

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

  public searchForm = new FormControl();
  private searchValue$ = this.searchForm.valueChanges.pipe(
    debounceTime(1000),
    multicast(() => new BehaviorSubject(null))
  );

  public tickets$ = combineLatest(this.ticketStore.tickets$, this.searchValue$).pipe(
    tap(([tickets, search]) => {

      if (search === null || search === '') {
        for (const ticket of tickets) {

          ticket.next({
            ...ticket.getValue(),
            hidden: false
          })
        }
        return;
      }

      for (const ticket of tickets) {
        let hidden = true;

        if (ticket.getValue().id == search) {
          hidden = false;
        }

        ticket.next({
          ...ticket.getValue(),
          hidden
        })

      }

    }),
    map(([tickets, search]) => {
      return tickets;
    })
  );
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


    this.searchValue$.connect();
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
