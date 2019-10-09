import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Log } from '@microgamma/loggator';
import { AuthStore } from '../../services/auth/auth.store';
import { TicketStore } from '../../services/tickets/ticket.store';
import { RestActions } from '../../../../../store/src/lib/actions';
import { Ticket } from '../../services/tickets/ticket.interface';


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
  public loadingTickets$ = this.ticketStore.loading$;

  constructor(private authStore: AuthStore, private ticketStore: TicketStore) {

  }

  public ngOnInit(): void {
    this.ticketStore.dispatch(RestActions.REQUEST);
  }

  // constructor(private userStore: UserStore) {
    // this.users$ = store.select(selectAllUsers(null));

    // this.users$ = this.store.select('users');

    // this.$log.d('userStore', userStore);
    //
    // this.counter$ = userStore.store$;
    //
    // this.counter$.subscribe((value) => {
    //   const state = value;
    //   this.$log.d('counting', state);
    //   this.count = state;
    // })

    // this.counter$ = this.userStore.store$;
  // }

  //
  // increment() {
  //   this.$log.d('incrementing');
  //   // this.userStore.store.dispatch(UserStore.GET_USERS(1));
  //   this.userStore.dispatch(UserStore.GET_USERS, {
  //     name: 'alice'
  //   });
  //
  // }
  //
  // decrement() {
  //   this.$log.d('decrementing');
  //   // this.userStore.store.dispatch(UserStore.DECREMENT(2));
  //   this.userStore.dispatch(UserStore.DECREMENT, {
  //     name: 'bob'
  //   });
  // }
  changeStatus(i: Ticket) {
    this.ticketStore.dispatch('CHANGESTATUS', i);
  }
}
