import { BaseStore, Effect, Reduce, RestActions, Store } from '@microphi/store';
import { Injectable } from '@angular/core';
import { Ticket } from './ticket.interface';
import { BackendService } from './ticket.service';

interface TicketsState {
  tickets: Ticket[]
}

@Store({
  name: 'ticketStore',
  initialState: JSON.parse(localStorage.getItem('ticketStore')) || { tickets: [] }
})
@Injectable()
export class TicketStore extends BaseStore<TicketsState> {


  constructor(private ticketService: BackendService) {
    super();
  }

  @Effect(RestActions.REQUEST, RestActions.RESPONSE, RestActions.ERROR)
  private getTickets(state: Ticket[], payload) {

    return this.ticketService.tickets();
  }

  @Reduce(RestActions.RESPONSE)
  private onAuth(state, payload) {

    this.state.tickets.push(payload);

    return state;
  }

}
