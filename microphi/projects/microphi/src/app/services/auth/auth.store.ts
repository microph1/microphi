import { AuthService } from './auth.service';
import { Store, BaseStore, Action, Effect, Reduce, RestActions} from '@microphi/store';

export interface AuthState {
  isAuth: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    realms: string[];
    role: string;
    token: string;
  }
}

@Store({
  name: 'authStore',
  initialState: localStorage.getItem('authStore') || {}
})
export class AuthStore extends BaseStore<AuthState> {

  @Action(RestActions.REQUEST)
  public static AuthRequest;

  @Action(RestActions.RESPONSE)
  public static AuthResponse;

  @Action(RestActions.ERROR)
  public static AuthError;

  constructor(private authService: AuthService) {
    super();
    if (this.state.user) {
      // should check token validity
      // this.authService.validateToken();
    }
  }


  @Effect(RestActions.REQUEST, RestActions.RESPONSE, RestActions.ERROR)
  private requestAuth(state: AuthState, payload) {

    return this.authService.authenticate({
      email: payload.email,
      password: payload.password
    });
  }

  @Reduce(RestActions.RESPONSE)
  private onAuth(state, payload) {
    console.log('running reducer', state, payload);
    state = payload;
    return state;
  }

  @Reduce(RestActions.ERROR)
  public onAuthError(state, err) {
    console.log('got error', state, err);
    return {};
  }

}
