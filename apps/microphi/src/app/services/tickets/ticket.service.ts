import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { Ticket, User } from './ticket.interface';

/**
 * This service acts as a mock back-end.
 * It has some intentional errors that you might have to fix.
 */

function randomDelay() {
  return Math.random() * 4000;
}

function generateTickets(total: number): Ticket[] {
  const tickets = [];

  for (let i = 0; i < total; i++) {
    tickets.push({
      id: i,
      description: `Install a monitor arm ${i}`,
      assigneeId: i * 2,
      completed: false
    });
  }

  return tickets;
}

@Injectable()
export class BackendService {
  storedTickets: Ticket[] = generateTickets(12);

  storedUsers: User[] = [{ id: 111, name: 'Victor' }];

  lastId = 1;

  private findTicketById = id => this.storedTickets.find(ticket => ticket.id === +id);
  private findUserById = id => this.storedUsers.find(user => user.id === +id);

  tickets() {
    return of(this.storedTickets).pipe(delay(4000));
  }

  ticket(id: number): Observable<Ticket> {
    return of(this.findTicketById(id)).pipe(delay(randomDelay()));
  }

  users() {
    return of(this.storedUsers).pipe(delay(randomDelay()));
  }

  user(id: number) {
    return of(this.findUserById(id));
  }

  newTicket(payload: { description: string }) {
    const newTicket: Ticket = {
      id: ++this.lastId,
      description: payload.description,
      assigneeId: null,
      completed: false
    };

    return of(newTicket).pipe(
      delay(randomDelay()),
      tap((ticket: Ticket) => this.storedTickets.push(ticket))
    );
  }

  assign(ticketId: number, userId: number) {
    const foundTicket = this.findTicketById(+ticketId);
    const user = this.findUserById(+userId);

    if (foundTicket && user) {
      return of(foundTicket).pipe(
        delay(randomDelay()),
        map((ticket: Ticket) => {
          ticket.assigneeId = +userId;
          return ticket;
        })
      );
    }

    return throwError(new Error('ticket or user not found'));
  }

  complete(ticketId: number, completed: boolean) {
    const foundTicket = this.findTicketById(+ticketId);
    if (foundTicket) {
      return of(foundTicket).pipe(
        delay(randomDelay()),
        map((ticket: Ticket) => {
          ticket.completed = completed;
          return ticket;
        })
      );
    }

    return throwError(new Error('ticket not found'));
  }
}
