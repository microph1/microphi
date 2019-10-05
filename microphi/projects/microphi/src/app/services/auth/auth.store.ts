import { AuthService } from './auth.service';



export class RestActions {
  public static REQUEST = 'REQUEST';
  public static RESPONSE = 'RESPONSE';
  public static ERROR = 'ERROR';
}

export class AuthActions extends RestActions {}

@Store({
  name: 'authStore',
  initialState: localStorage.getItem('authStore') || {}
})
export class AuthStore extends BaseStore {

  @Action(RestActions.REQUEST)
  public static AuthRequest;

  @Action(RestActions.RESPONSE)
  public static AuthResponse;

  @Action(RestActions.ERROR)
  public static AuthError;


  constructor(private authService: AuthService) {
    super();
  }

  @Effect(RestActions.REQUEST, RestActions.RESPONSE, RestActions.ERROR)
  private requestAuth(state, payload) {



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
