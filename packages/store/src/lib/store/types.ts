import { Observable } from 'rxjs';
import { Brand, Primitive } from 'utility-types';

export type Key = string | symbol;

export type Fn = (...args: any[]) => any;

export type anything = Record<string, unknown>;

export type getPayloadFromActionType<A, C extends keyof A> =
  A[C] extends Fn ? A[C] extends () => any
    ? never[] : A[C] extends (...args: infer T) => any
      ? T : never[] : A[C][];

export type PureReducer<T extends Primitive> = Brand<T, 'reducer'>;

export type makeEffects<Actions> = {
  // Effects
  [k in keyof Actions]: Actions[k] extends PureReducer<Primitive>
    ? never
    : Actions[k]
}

export type makeStore<State, Actions> =
  {
    [k in keyof makeEffects<Actions>]: makeEffects<Actions>[k]
  }
  // &
  // Actions
  &
  {
    // Reducers
    [k in keyof Actions as `on${Capitalize<string & k>}`]: Actions[k] extends (...args: any) => Observable<infer O>
    ? (state: State, payload: O) => State
    : Actions[k] extends PureReducer<infer O>
      ? (state?: State, payload?: O) => State
      : (state?: State) => State

  };

export interface LoadingState<A> {
  code: keyof A;
  payload?: any;
  response?: any;
  error?: any;
  status: boolean;
}
