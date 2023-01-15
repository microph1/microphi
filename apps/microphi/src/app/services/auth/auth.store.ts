import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Effect, makeStore, Reduce, Store } from '@microphi/store';


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

export interface AuthActions {
  authenticate: (payload: {email: string, password: string}) => Observable<User>,
  validate: (token: string) => Observable<User>,
  logout: () => Observable<void>,
}
//
// @Store({
//   initialState: JSON.parse(localStorage.getItem('AuthStore')) || {},
// })
@Injectable()
export class AuthStore extends Store<AuthState, AuthActions> implements makeStore<AuthState, AuthActions>{

  public isAuth$ = this.select(({isAuth}) => isAuth);
  public user$ = this.select(({user}) => user);

  constructor(private authService: AuthService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(JSON.parse(localStorage.getItem('AuthStore')) || {});
  }

  @Effect()
  authenticate(payload: { email: string; password: string }): Observable<User> {
    return this.authService.authenticate({
      email: payload.email,
      password: payload.password
    });
  }

  @Effect()
  logout(): Observable<void> {
    return undefined;
  }

  @Reduce()
  onAuthenticate(state: AuthState, payload: User): AuthState {
    return { ...state, ...payload };
  }

  @Reduce()
  onLogout(state: AuthState, payload: void): AuthState {
    return {user: undefined, isAuth: false};
  }

  @Reduce()
  onValidate(state: AuthState, user: User): AuthState {
      return {...state, isAuth: true, ...user};
  }

  @Effect()
  validate(token: string): Observable<User> {
      return this.authService.validateToken(token);
  }



}
