import { map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '../store';
import { BaseStore } from '../base-store';
import { Reduce } from '../reduce';

export interface HttpState {
  isLoading: boolean;
  error?: HttpErrorResponse;
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
@Injectable({
  providedIn: 'root'
})
export class HttpStatusStore extends BaseStore<HttpState> {
  // TODO: add explicit constructor



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
    };
  }

}
