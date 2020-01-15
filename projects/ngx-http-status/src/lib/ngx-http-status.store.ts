import { Reduce, BaseStore, Store } from '@microphi/store';
import { map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface NgxHttpState {
  isLoading: boolean;
  error?: HttpErrorResponse
}

export enum NgxHttpActions {
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
  actions: NgxHttpActions
})
@Injectable({
  providedIn: 'root'
})
export class NgxHttpStatusStore extends BaseStore<NgxHttpState> {


  public isLoading$ = this.store$.pipe(
    map((state) => {
      return state.isLoading;
    })
  );


  @Reduce(NgxHttpActions.REQUEST)
  private onRequest(): NgxHttpState {
    return {
      isLoading: true
    };
  }

  @Reduce(NgxHttpActions.RESPONSE)
  private onResponse(): NgxHttpState {
    return {
      isLoading: false
    };
  }

  @Reduce(NgxHttpActions.ERROR)
  public onError(state: NgxHttpState, err): NgxHttpState {
    return {
      isLoading: false,
      error: err
    }
  }


}
