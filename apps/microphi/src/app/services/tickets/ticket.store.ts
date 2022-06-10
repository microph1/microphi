import { Injectable } from '@angular/core';
import { Ticket } from './ticket.interface';
import { BackendService } from './ticket.service';
import { bufferCount, catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { from, NEVER } from 'rxjs';
import { Store, Effect, ObservableList, Reduce, Store } from '@microphi/store';


type TicketWithState = Ticket & { isLoading?: boolean; hidden?: boolean };

interface TicketsState {
  tickets: ObservableList<TicketWithState>;
}

export enum TicketActions {
  SEARCH,
  FIND_ALL,
  FIND_ONE,
  CHANGE_STATUS,
  ASSIGN
}

function getTicketsFromLocalStorage() {
  const initialState = {
    tickets: new ObservableList<TicketWithState>([])
  };

  const ticketStore = JSON.parse(localStorage.getItem('TicketStore'));

  if (ticketStore) {
    initialState.tickets.push(...ticketStore.tickets);
  }

  return initialState;

}

@Store({
  name: 'TicketStore',
  initialState: getTicketsFromLocalStorage(),
  actions: TicketActions,
})
@Injectable()
export class TicketStore extends Store<TicketsState> {
  public tickets$ = this.store$.pipe(
    map((state) => {
      return state.tickets;
    })
  );

  constructor(private ticketService: BackendService) {
    super();
  }

  @Effect(TicketActions.FIND_ALL)
  private getTickets() {
    let numberOfTickets = 0;

    return this.ticketService.tickets().pipe(
      switchMap((tickets) => {
        numberOfTickets = tickets.length;
        return from(tickets);
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
  private changeStatus(payload: Ticket) {

    return this.ticketService.complete(payload.id, !payload.completed);
  }

  @Reduce(TicketActions.FIND_ALL)
  private onResponse(state, payload: Ticket[]) {
    // this is the final list of tickets
    state.tickets.set(...payload);

    return state;
  }

  @Reduce(TicketActions.CHANGE_STATUS)
  private onStatusChanged(state, payload: Ticket) {

    state.tickets.updateOne({ ...payload, isLoading: false});

    return state;
  }

  @Reduce(TicketActions.ASSIGN)
  private onAssign(state, payload) {
    return state;
  }

  @Reduce(TicketActions.SEARCH)
  private onSearch(state, searchTerm) {

    console.log('searching by', searchTerm);

    for (const ticket of state.tickets) {
      const t = ticket.getValue();
      if (!t.description.includes(searchTerm)) {
        ticket.next({
          ...t,
          hidden: true
        });
      } else {
        ticket.next({
          ...t,
          hidden: false
        });
      }
    }

    return state;
  }

}
