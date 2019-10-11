import { Reduce, BaseStore, Store } from '@microphi/store';
import { map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface HttpState {
  isLoading: boolean;
  error?: HttpErrorResponse
}

export enum HttpActions {
  REQUEST,
  RESPONSE,
  ERROR
}

@Store({
  name: 'httpStatusStore',
  initialState: {
    isLoading: false,
    error: null
  },
  actions: HttpActions
})
@Injectable()
export class HttpStatusStore extends BaseStore<HttpState> {


  public isLoading$ = this.store$.pipe(
    map((state) => {
      return state.isLoading;
    })
  );


  @Reduce(HttpActions.REQUEST)
  private onRequest(): HttpState {
    return {
      isLoading: true
    };
  }

  @Reduce(HttpActions.RESPONSE)
  private onResponse(): HttpState {
    return {
      isLoading: false
    };
  }

  @Reduce(HttpActions.ERROR)
  public onError(state: HttpState, err): HttpState {
    return {
      isLoading: false,
      error: err
    }
  }


}
