import { Action, BaseStore, Reduce, RestActions, Store } from '@microphi/store';
import { map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface HttpState {
  isLoading: boolean;
  error?: HttpErrorResponse
}

@Store({
  name: 'httpStatusStore',
  initialState: {
    isLoading: false,
    error: null
  }
})
@Injectable()
export class HttpStatusStore extends BaseStore<HttpState> {

  @Action(RestActions.REQUEST)
  public static HttpRequest;

  @Action(RestActions.RESPONSE)
  public static HttpResponse;

  @Action(RestActions.ERROR)
  public static HttpError;


  public isLoading$ = this.store$.pipe(
    map((state) => {
      return state.isLoading;
    })
  );


  @Reduce(RestActions.REQUEST)
  private onRequest(): HttpState {
    return {
      isLoading: true
    };
  }

  @Reduce(RestActions.RESPONSE)
  private onResponse(): HttpState {
    return {
      isLoading: false
    };
  }

  @Reduce(RestActions.ERROR)
  public onError(state: HttpState, err): HttpState {
    return {
      isLoading: false,
      error: err
    }
  }


}
