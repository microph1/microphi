import { Component } from '@angular/core';
import { Log } from '@microgamma/loggator';
import { UserStore } from '../services/user/user.store';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [
    UserStore
  ]
})
export class HomeComponent {

  @Log()
  private $log;
  private users$;

  public counter$;
  public count;

  public actions$ = this.userStore.actions$;

  constructor(private userStore: UserStore) {
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

    this.counter$ = this.userStore.store$;
  }

  ngOnInit() {
    // this.store.dispatch(requestUsers({ users: []}));
  }




  loadUsers() {
    // this.store.dispatch(requestUsers({ users: []}))
  }

  increment() {
    this.$log.d('incrementing');
    // this.userStore.store.dispatch(UserStore.GET_USERS(1));
    this.userStore.dispatch(UserStore.GET_USERS, {
      name: 'alice'
    });

  }

  decrement() {
    this.$log.d('decrementing');
    // this.userStore.store.dispatch(UserStore.DECREMENT(2));
    this.userStore.dispatch(UserStore.DECREMENT, {
      name: 'bob'
    });
  }
}
