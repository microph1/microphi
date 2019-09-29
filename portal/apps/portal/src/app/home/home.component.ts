import { Component } from '@angular/core';
import { Log } from '@microgamma/loggator';
import { Store } from '@ngrx/store';
import { UserModel } from '../user/user.model';
import { requestUsers } from '../user/user.actions';
import { UserStore } from '../user/user.store';


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

  constructor(private userStore: UserStore) {
    // this.users$ = store.select(selectAllUsers(null));

    // this.users$ = this.store.select('users');

    this.$log.d('userStore', userStore);

    this.counter$ = userStore.store$;

    this.counter$.subscribe((value) => {
      const state = value;
      this.$log.d('counting', state);
      this.count = state;
    })
  }

  ngOnInit() {
    // this.store.dispatch(requestUsers({ users: []}));
  }




  loadUsers() {
    // this.store.dispatch(requestUsers({ users: []}))
  }

  increment() {
    this.$log.d('incrementing');
    this.userStore.store.dispatch(UserStore.INCREMENT(1));
  }

  decrement() {
    this.$log.d('decrementing');
    this.userStore.store.dispatch(UserStore.DECREMENT(2));
  }
}
