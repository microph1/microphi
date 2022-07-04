import { Injectable } from '@angular/core';
import { Ticket } from './ticket.interface';
import { BackendService } from './ticket.service';
import { bufferCount, catchError, from, mergeMap, NEVER, Observable, switchMap } from 'rxjs';
import { Effect, makeStore, Reduce, Store } from '@microphi/store';
import { map } from 'rxjs/operators';


interface TicketsState {
  tickets: Ticket[];
}

export interface TicketActions {
  findAll: () => Observable<Ticket[]>,
  // findOne: () => Observable<Ticket>,
  changeStatus: ({id, completed}: { id: number, completed: boolean }) => Observable<Ticket>,
  assign: () => Observable<any>
}

// SEARCH,
// FIND_ONE,
// CHANGE_STATUS,
// ASSIGN


@Injectable()
export class TicketStore extends Store<TicketsState, TicketActions> implements makeStore<TicketsState, TicketActions> {
  tickets$ = this.select((state) => state.tickets);

  constructor(private ticketService: BackendService) {
    super({
      tickets: []
    });
  }

  @Effect<TicketStore>('findAll')
  findAll(): Observable<Ticket[]> {
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


  @Reduce<TicketActions>('findAll')
  onFindAll(state: TicketsState, tickets: Ticket[]): TicketsState {
    return {...state, tickets};
  }

  @Effect<TicketActions>('changeStatus')
  changeStatus({id, completed}: { id: number, completed: boolean }): Observable<Ticket> {
    return this.ticketService.complete(id, completed);
  }

  @Reduce<TicketActions>('changeStatus')
  onChangeStatus(state: TicketsState, payload: Ticket): TicketsState {
    const ticket = state.tickets.find((t) => t.id === payload.id);
    ticket.completed = payload.completed;
    return state;
  }

  assign(): Observable<any> {
    return undefined;
  }

  @Reduce<TicketActions>('assign')
  onAssign(state: TicketsState, payload: any): TicketsState {
    return state;
  }



  //
  // @Reduce<TicketActions>('SEARCH')
  // private onSearch(state, searchTerm) {
  //
  //   console.log('searching by', searchTerm);
  //
  //   for (const ticket of state.tickets) {
  //     const t = ticket.getValue();
  //     if (!t.description.includes(searchTerm)) {
  //       ticket.next({
  //         ...t,
  //         hidden: true
  //       });
  //     } else {
  //       ticket.next({
  //         ...t,
  //         hidden: false
  //       });
  //     }
  //   }
  //
  //   return state;
  // }

}
