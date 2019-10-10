import { Effect, Reduce, BaseStore, Store } from '@microphi/store';
import { Injectable } from '@angular/core';
import { Ticket } from './ticket.interface';
import { BackendService } from './ticket.service';
import { bufferCount, catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { from, NEVER } from 'rxjs';

type TicketWithState = Ticket & { isLoading?: boolean}

interface TicketsState {
  tickets: TicketWithState[]
}

export enum TicketActions {
  FIND_ALL,
  FIND_ONE,
  CHANGE_STATUS
}

@Store({
  name: 'ticketStore',
  initialState: { tickets: [] },
  actions: TicketActions
})
@Injectable()
export class TicketStore extends BaseStore<TicketsState> {
  public tickets$ = this.store$.pipe(
    map((state) => state.tickets)
  );

  constructor(private ticketService: BackendService) {
    super();
  }

  @Effect(TicketActions.FIND_ALL)
  private getTickets(state: Ticket[], payload) {
    let numberOfTickets = 0;

    return this.ticketService.tickets().pipe(
      switchMap((tickets) => {
        console.log('parsing tickets', tickets);
        numberOfTickets = tickets.length;
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
      }),
      bufferCount(numberOfTickets)
    );
  }

  @Effect(TicketActions.CHANGE_STATUS)
  private changeStatus(state, payload: Ticket) {

    const ticketToUpdate = this.state.tickets.find((t) => t.id === payload.id);
    if (ticketToUpdate) {
      ticketToUpdate.isLoading = true;
    }

    return this.ticketService.complete(payload.id, !payload.completed).pipe(
      tap((t: TicketWithState )=> t.isLoading = false)
    );
  }

  @Reduce(TicketActions.FIND_ALL)
  private onResponse(state, payload: Ticket[]) {
    this.state.tickets.push(...payload);

    return state;
  }

  @Reduce(TicketActions.CHANGE_STATUS)
  private onStatusChanged(state, payload: Ticket) {
    this.state.tickets.forEach((ticket) => {
      if (ticket.id === payload.id) {
        ticket.completed = payload.completed
      }

    });

    return state;
  }
}
