import { map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '../store';
import { Actions, BaseStore, Reducer, Updater } from '../base-store';
import { Reduce } from '../reduce';
import { Observable } from 'rxjs';

export interface HttpState {
  isLoading: boolean;
  error?: HttpErrorResponse;
}

export interface HttpActions extends Actions {
  REQUEST: () => Observable<void>;
  RESPONSE: () => Observable<void>;
  ERROR: () => Observable<HttpErrorResponse>;
}

@Store({
  initialState: {
    isLoading: false,
    error: null
  },
})
@Injectable({
  providedIn: 'root'
})
export class HttpStatusStore extends BaseStore<HttpState, HttpActions> {
  // TODO: add explicit constructor

  public isLoading$ = this.store$.pipe(
    map((state) => {
      return state.isLoading;
    })
  );


  @Reduce<HttpActions>('REQUEST')
  private onRequest: Reducer<HttpState, HttpActions, 'REQUEST'> = (status) => {
    return {
      isLoading: true
    };
  }

  @Reduce<HttpActions>('RESPONSE')
  private onResponse: Reducer<HttpState, HttpActions, 'RESPONSE'> = (state) => {
    return {
      isLoading: false
    };
  }

  @Reduce<HttpActions>('ERROR')
  public onError: Reducer<HttpState, HttpActions, 'ERROR'> = (state, err) => {
    return {
      isLoading: false,
      error: err
    };
  }

}
