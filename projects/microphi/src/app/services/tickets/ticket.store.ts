import { BaseStore, Effect, Reduce, Store, ObservableList } from '@microphi/store';
import { Injectable } from '@angular/core';
import { Ticket } from './ticket.interface';
import { BackendService } from './ticket.service';
import { bufferCount, catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { BehaviorSubject, from, NEVER } from 'rxjs';


type TicketWithState = Ticket & { isLoading?: boolean };

interface TicketsState {
  tickets: TicketWithState[];
}

export enum TicketActions {
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
  actions: TicketActions
})
@Injectable()
export class TicketStore extends BaseStore<TicketsState> {
  public tickets$ = this.store$.pipe(
    map((state) => {
      return state.tickets;
    })
  );

  constructor(private ticketService: BackendService) {
    super();
  }

  @Effect(TicketActions.FIND_ALL)
  private getTickets(state: Ticket[], payload) {
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
  private changeStatus(state, payload: Ticket) {

    // const ticketToUpdate = this.state.tickets.find((t) => t.id === payload.id);
    // if (ticketToUpdate) {
    //   ticketToUpdate.isLoading = true;
    // }

    state.tickets.updateOne({...payload, isLoading: true});

    return this.ticketService.complete(payload.id, !payload.completed);
  }

  @Reduce(TicketActions.FIND_ALL)
  private onResponse(state, payload: Ticket[]) {

    // const newTickets = payload
    //   .filter((remoteTicket) => {
    //     return state.tickets.every((localTicket) => {
    //       return localTicket.id !== remoteTicket.id;
    //     });
    //   });

    state.tickets.push(...payload);

    return state;
  }

  @Reduce(TicketActions.CHANGE_STATUS)
  private onStatusChanged(state, payload: Ticket) {

    state.tickets.updateOne({ ...payload, isLoading: false});

    // return state;
  }

  @Reduce(TicketActions.ASSIGN)
  private onAssign(state, payload) {
    return state;
  }


}
