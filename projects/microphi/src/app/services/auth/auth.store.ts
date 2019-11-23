import { AuthService } from './auth.service';
import { BaseStore, Effect, Reduce, Store } from '@microphi/store';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface AuthState {
  isAuth: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    realms: string[];
    role: string;
  };
  token?: string;
  error?: HttpErrorResponse
}

export enum AuthActions {
  AUTHENTICATE,
  VALIDATE,
  LOGOUT
}

@Store({
  name: 'AuthStore',
  initialState: JSON.parse(localStorage.getItem('AuthStore')) || {},
  actions: AuthActions
})
@Injectable()
export class AuthStore extends BaseStore<AuthState> {

  public isAuth$ = this.store$.pipe(
    map((state) => {
      return state.isAuth;
    })
  );

  public authError$ = this.store$.pipe(map(state => state.error));

  public user$ = this.store$.pipe(map(state => state.user));


  constructor(private authService: AuthService) {
    super();

    if (this.state.error) {
      this.state.error = null;
    }

    if (this.state.hasOwnProperty('token')) {
      this.dispatch(AuthActions.VALIDATE, this.state.token);
    }
  }

  @Effect(AuthActions.VALIDATE)
  public validateToken(payload) {
    return this.authService.validateToken(payload);
  }

  @Effect(AuthActions.AUTHENTICATE)
  private requestAuth(payload) {

    return this.authService.authenticate({
      email: payload.email,
      password: payload.password
    });
  }

  @Reduce(AuthActions.AUTHENTICATE)
  private onAuth(payload) {
    const { token, ...user } = payload;

    return {
      isAuth: true,
      user: user,
      token: token
    };
  }

  @Reduce('onError')
  public onAuthError(err): AuthState {

    return {
      isAuth: false,
      error: err
    }
  }

  @Reduce(AuthActions.LOGOUT)
  private logout(): AuthState {
    return {
      isAuth: false
    }
  }

}
