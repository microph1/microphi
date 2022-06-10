import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { Actions, BaseStore, Effect, Reduce, Reducer, Store, Updater } from '@microphi/store';
import { Observable } from 'rxjs';


export interface User {
  id: string;
  name: string;
  email: string;
  realms: string[];
  role: string;
  token: string;
}


export interface AuthState {
  isAuth: boolean;
  user?: User;
}

export interface AuthActions extends Actions {
  AUTHENTICATE: (payload: {email: string, password: string}) => Observable<User>,
  VALIDATE: (token: string) => Observable<User>,
  LOGOUT: () => Observable<void>,
}

@Store({
  initialState: JSON.parse(localStorage.getItem('AuthStore')) || {},
})
@Injectable()
export class AuthStore extends BaseStore<AuthState, AuthActions> {

  public isAuth$ = this.select(({isAuth}) => isAuth);
  public user$ = this.select(({user}) => user);

  constructor(private authService: AuthService) {
    super();
  }

  @Effect<AuthActions>('VALIDATE')
  public validateToken: Updater<AuthActions, 'VALIDATE'> = (payload) => {
    return this.authService.validateToken(payload);
  }

  @Reduce<AuthActions>('VALIDATE')
  public onTokenValidated: Reducer<AuthState, AuthActions, 'VALIDATE'> = (state, user) => {
    state = { ...state, isAuth: true, ...user }
    return state;
  }

  @Effect<AuthActions>('AUTHENTICATE')
  public requestAuth: Updater<AuthActions, 'AUTHENTICATE'> = (payload) => {

    return this.authService.authenticate({
      email: payload.email,
      password: payload.password
    });
  }

  @Reduce<AuthActions>('AUTHENTICATE')
  private onAuth: Reducer<AuthState, AuthActions, 'AUTHENTICATE'> = (state, user) => {
    state = { ...state, ...user };
    return state;
  }

  @Reduce<AuthActions>('LOGOUT')
  private logout: Reducer<AuthState, AuthActions, 'LOGOUT'> = (state) => {
    state = {user: undefined, isAuth: false};
    return state;
  }

}
