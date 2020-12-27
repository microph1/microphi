import { Observable, Subject } from 'rxjs';
import { Class, PickByValue, Subtract } from 'utility-types';


// type parseFn<F extends (args: any) => any> = F extends (args: infer A) => any ?
//   A extends ArrayLike<any> ? (...args: A) => ReturnType<F> : (args: A) => ReturnType<F> : ;
type PasArray<P> = P extends any[] ? P : [P];

export type EffectFn<P, R, R$ = Observable<R>> =
  P extends any[] ? (...args: P) => R$ : (args: P) => R$;

  // R extends Observable<infer T> ?
  //     (args: P) => R
  //   :
  //     (args: P) => Observable<R>;

export type PureReducerFn<T, S> = (s: S, args: T) => S;


export type ReduceFn<P, S> = (s: S, args: P) => S;


function makeObject<D>(): D  {
  return {} as D;
}

interface Action {
  name: string;
  payload?: unknown;
}

export type getPayloadTypeFromAction<A, C extends keyof A> = A[C] extends () => any ? never[] : A[C] extends (...args: infer T) => any ? T : never[];


export abstract class Dispatcher<Actions> {
  protected actions$: Map<keyof Actions, Subject<Action>> = new Map();


  constructor() {

    const descriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(this));

    // console.log({descriptors});
    Object.keys(descriptors)
      .filter(name => name !== 'constructor')
      .filter(name => !name.startsWith('on'))
      .forEach((action) => {

        console.log('setting subject for', action);

        // @ts-ignore
        this.actions$.set(action, new Subject<Action>());

      });
  }

  public dispatch<
    C extends keyof PickByValue<Actions, EffectFn<any, any> | PureReducerFn<any, any>>,
  >(
    action: C,
    ...payload: Actions[C] extends EffectFn<any, any> ?
      Parameters<Actions[C]> :
      Actions[C] extends PureReducerFn<infer P, any> ?
        PasArray<P> : never[]
  ) {

    if (!this.actions$.has(action)) {
      throw new Error(`Cannot find action ${action}`);
    }

    this.actions$.get(action).next({name: 'effectName' || 'noopEffect', payload});
  }


}

// export type DispatcheTyper<Actions extends {}> = {
//   [Action in keyof Actions]: Actions[Action] exte
//   nds
// }

//
// export interface Dispatcher<Actions> extends Actions {}
