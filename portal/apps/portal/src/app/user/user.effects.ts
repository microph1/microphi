import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { concatMap, map, mergeMap, tap } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import * as UserActions from './user.actions';
import { loadUsers, mapUsers, requestUsers } from './user.actions';
import { UserService } from '../services/user/user.service';
import { Log } from '@microgamma/loggator';



@Injectable()
export class UserEffects {

  @Log()
  private $l;

  @Effect()
  loadUsers$ = this.actions$.pipe(
    ofType(requestUsers.type),
    tap((action) => {
      this.$l.d('running effect for action', action);
    }),
    /** An EMPTY observable only emits completion. Replace with your own observable API request */

    concatMap(() => {
      this.$l.d('calling service');
      return this.userService.findAll();
    }),
    map((users) => {
      return loadUsers({users});
    })
  );


  constructor(private actions$: Actions, private userService: UserService) {
    console.log('actions', actions$);
  }


}
