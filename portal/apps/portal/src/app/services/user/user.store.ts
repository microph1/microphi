import { Injectable } from '@angular/core';
import { Log } from '@microgamma/loggator';
import { of, throwError } from 'rxjs';
import { Store } from '../../store/store';
import { BaseStore } from '../../store/base-store';
import { Action } from '../../store/action';
import { UserService } from './user.service';
import { Reduce } from '../../store/reduce';
import { Effect } from '../../store/effect';


@Injectable()
@Store({
  name: 'userStore',
  initialState: JSON.parse(localStorage.getItem('userStore')) || []
})
export class UserStore extends BaseStore {

  @Log()
  private $_l;

  @Action()
  static GET_USERS = 'GET_USERS';

  @Action()
  static GOT_USERS = 'GOT_USERS';

  @Action()
  static DECREMENT = 'DECREMENT';

  constructor(private userService: UserService) {
    super();
  }

  @Reduce(UserStore.GOT_USERS)
  private getUsers(state, payload) {
    this.$_l.d('running getUsers', state, payload);
    return state.concat(payload);
  }

  @Reduce(UserStore.DECREMENT)
  private decrement(state, payload) {
    this.$_l.d(state, payload);
    state.push(payload);
    return state;
  }

  @Effect(UserStore.GET_USERS, 'START_LOADING')
  public startLoading() {
    return of(true);
  }

  @Effect(UserStore.GET_USERS, UserStore.GOT_USERS)
  private effectOfGetUsers(state, payload) {
    console.log('effect of get users', state, payload);

    return this.userService.findAll();
  }

  @Effect(UserStore.GOT_USERS, 'STOP_LOADING')
  public stopLoading() {
    return of(true);
  }

  @Effect(UserStore.DECREMENT, 'GOT_DECREMENT')
  public effectOfDecrementWillFail() {
    return throwError('api failure');
  }

}
