import { AuthService } from './auth.service';
import { BaseStore, Effect, Reduce, Store } from '@microphi/store';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

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
}

export enum AuthActions {
  AUTHENTICATE,
  VALIDATE,
  LOGOUT,
  VALIDATE_INITIAL_STATE
}

@Store({
  name: 'AuthStore',
  initialState: JSON.parse(localStorage.getItem('AuthStore')) || {},
  actions: AuthActions
})
@Injectable()
export class AuthStore extends BaseStore<AuthState> {

  public isAuth$ = this.store$.pipe(
    map<AuthState, boolean>(state => state.isAuth)
  );
  public user$ = this.store$.pipe(map(state => state.user));

  constructor(private authService: AuthService) {
    super();

    this.dispatch(AuthActions.VALIDATE_INITIAL_STATE);
  }

  @Reduce(AuthActions.VALIDATE_INITIAL_STATE)
  protected validateStoredToken(state: AuthState) {
    if (state.token) {
      this.dispatch(AuthActions.VALIDATE, state.token);
    }
    return state;
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

  // @Reduce('onError')
  // public onAuthError(err): AuthState {
  //
  //   return {
  //     isAuth: false,
  //     error: err
  //   };
  // }

  @Reduce(AuthActions.LOGOUT)
  private logout(): AuthState {
    return {
      isAuth: false
    };
  }

}
