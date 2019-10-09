import { BaseStore, Effect, Reduce, RestActions, Store } from '@microphi/store';
import { Injectable } from '@angular/core';
import { Ticket } from './ticket.interface';
import { BackendService } from './ticket.service';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { from, NEVER } from 'rxjs';

interface TicketsState {
  tickets: Ticket[]
}

@Store({
  name: 'ticketStore',
  initialState: { tickets: [] }
})
@Injectable()
export class TicketStore extends BaseStore<TicketsState> {
  public tickets$ = this.store$.pipe(
    map((state) => state.tickets)
  );


  constructor(private ticketService: BackendService) {
    super();
  }

  @Effect(RestActions.REQUEST, RestActions.RESPONSE, RestActions.ERROR)
  private getTickets(state: Ticket[], payload) {

    return this.ticketService.tickets().pipe(
      switchMap((tickets) => {
        console.log('parsing tickets', tickets);
        return from(tickets);
      }),
      tap((ticket) => {
        console.log('parsing ticket', ticket);
      }),
      mergeMap((ticket: Ticket) => {

        return this.ticketService.user(ticket.assigneeId).pipe(
          map((user) => {
            ticket.assignee = user;
            return ticket;
          }),
          catchError(err => {
            console.error(err);
            // silently fail
            return NEVER;
          })
        );
      })
    );
  }

  @Effect('CHANGESTATUS', 'STATUSCHANGED', 'STATUSCHANGEERROR')
  private changeStatus(state, payload: Ticket) {
    return this.ticketService.complete(payload.id, !payload.completed);
  }

  @Reduce(RestActions.RESPONSE)
  private onResponse(state, payload) {
    this.state.tickets.push(payload);

    return state;
  }

  @Reduce('STATUSCHANGED')
  private onStatusChanged(state, payload: Ticket) {
    this.state.tickets.forEach((ticket) => {
      if (ticket.id === payload.id) {
        ticket.completed = payload.completed
      }

    });

    return state;
  }
}
