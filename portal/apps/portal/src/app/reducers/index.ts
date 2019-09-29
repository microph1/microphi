import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromUser from '../user/user.reducer';

export const initialState = 0;




export interface State {
  [fromUser.userFeatureKey]: fromUser.State;
}

export const reducers: ActionReducerMap<State> = {  [fromUser.userFeatureKey]: fromUser.reducer,
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];

