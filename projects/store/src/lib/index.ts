import { Observable } from 'rxjs';
import { PickByValue } from 'utility-types';


type Action<P, R> = [EffectFn<P, Observable<R>>, ReducerFn<R, unknown>];

type EffectFn<P, R> = (p: P) => Observable<R>;
type ReducerFn<P, S> = (s: S, p: P) => S;

interface UsersState {

  users: User[];
  selected?: User;
}

interface User {
  name: string;
  email: string;
}

type NoopEffect<T> = () => T;

interface UserActions {
  findAll: EffectFn<never, User[]>;
  onFindAll: ReducerFn<User[], UsersState>;

  select: NoopEffect<{index: number}>;
  onSelect: ReducerFn<{ index: number }, UsersState>;

  //
  // onSelect: Effect<number, User>;
  // selected: Reducer<User, UsersState>;

}

function Effect<
  T extends {}
>(name: keyof PickByValue<T, EffectFn<any, any>>) {
  return (target, key) => {

  };
}

function Reduce<
  T extends {},
>(name: keyof PickByValue<T, EffectFn<any, any> | NoopEffect<any>>) {
  return (target, key) => {

  }
}

class MyStore implements UserActions {
  select: NoopEffect<{ index: number; }>;

  @Effect<UserActions>('findAll')
  findAll(): Observable<User[]> {
    return undefined;
  }

  @Reduce<UserActions>('findAll')
  onFindAll(s: UsersState, p: User[]): UsersState {
    return undefined;
  }

  @Reduce<UserActions>('select')
  onSelect(s: UsersState, p: { index: number }): UsersState {
    return undefined;
  }

  dispatch<C extends keyof PickByValue<UserActions, EffectFn<any, any> | NoopEffect<any>>>(
    action: C,
    payload: UserActions[C] extends EffectFn<infer P, any> ? P : UserActions[C] extends NoopEffect<infer A> ? A : never
  ) {

  }
}

const store = new MyStore();

store.dispatch('findAll');
store.dispatch('select', );


// import { BaseStore } from './base-store';
// import { Class, FunctionKeys, ValuesType } from 'utility-types';
// import { StoreOptions } from './store';
// import { Observable, of } from 'rxjs';
//
// type getState<T> = T extends PhiStore.Store<infer _Options> ? Pick<_Options, 'state'> : never;
//
// export namespace PhiStore {
//
//   export interface StoreOptions {
//     actions: unknown;
//     state: unknown;
//   }
//
//   export function StoreFactory<T extends Class<{}>>(base: T) {
//     return class extends base {
//
//     };
//
//   }
//
//   export class Store<Options extends StoreOptions> {
//
//     options: Options;
//     state: unknown;
//
//
//     dispatch(action: unknown, payload?: unknown) {}
//   }
//
//
//
//   export function test<T extends Store<any>>(t: getState<Pick<T, 'state'>>) {
//     console.log('test function in namespace');
//
//   }
//
// }
//
// interface Options<A extends string[]> {
//   actions: A;
// }
//
// function base<T>() {
//   class Base {
//     prop: T;
//     private privateField = 0;
//   }
//   return Base;
// }
//
//
// function derived<
//   O extends Options<any>,
//   T = O extends Options<infer A> ? A : never
// >(o: O) {
//
//
//   let C = class extends base<O>() {
//     actions: T;
//
//     dispatch<A extends ValuesType<T>>(action: A, payload?: ThisType<typeof base>) {}
//   };
//
//   return C;
// }
//
// const options: Options<['one', 'two']> = {
//   actions: ['one', 'two'],
// };
//
// class Spec extends derived(options) {
//   constructor() {
//     super();
//   }
//
//   one(v: string) {}
//
// }
//
// const inst = new Spec();
// inst.dispatch('one');
//
//
// // @ts-ignore
// /**
//  *
//  *
//  *
//  *
//  *
//  *
//  *
//  */
//
//
// type fn = (...args: any[]) => any;
//
// type typedFn<Params, Return> =  (args: Params) => Return;
//
// type noParamsFn<f extends fn, R = ReturnType<f>> = f extends (...args: infer P) => any ?
//   P extends void ? () => R : (...args: P) => R : () => R;
//
// interface Act {
//   [action: string]: (...args: any[]) => any;
// }
//
//
// type getPayloadFromActionType<Actions, C extends keyof Actions> = Actions[C] extends () => any ? never[] : Actions[C] extends (...args: infer T) => any ? T : never[];
//
// type getResponseFromActionType<Actions, C extends keyof Actions> = Actions[C] extends fn ? ReturnType<Actions[C]> extends Observable<infer T> ? T extends Array<infer R> ? R : [T] : never[] : never[];
//
//
// export type Reducer<Actions, C extends keyof Actions> = (state: unknown, ...payload: getResponseFromActionType<Actions, C>) => unknown;
//
// // @ts-ignore
// abstract class Base<
//   State,
//   Actions extends Act,
//   > {
//
//   dispatch<C extends keyof Actions>(
//     actions: C,
//     ...payload: getPayloadFromActionType<Actions, C>
//   ) {}
//
//   // dispatch<
//   //   C extends keyof Actions,
//   //   P = Actions[C] extends () => any ? never : Actions[C] extends (...args: infer T) => any ? T : never
//   // >(action: C, payload?: P) {}
//
//   reduce<
//     C extends keyof Actions,
//     R = Actions[C] extends (...args: any[]) => any ? ReturnType<Actions[C]> extends Observable<infer Return> ? Return : never : never,
//     >(action: C, reducer?: (state: State, response: R) => State): State {
//
//
//     // todo reducer is the function that needs to be called on reduce
//     return undefined;
//   }
//
//
//   _reduce<C extends keyof Actions>(action: C, state: State, ...response: getResponseFromActionType<Actions, C>): State {
//     // const reduceFn =
//
//     // return this[action](state, [...response]);
//     return undefined;
//   }
// }
//
// // interface Base<
// //   State,
// //   Actions extends Act,
// // > {
// //   [P in keyof Actions]:
// // }
//
// // // It the runtime aspect could be manually replicated via
// // // type composition or interface merging.
// // // type FreezablePlayer = typeof Player & { shouldFreeze: boolean };
// // interface Base<
// //   // T extends Base<any, any>,
// //   Actions extends { [name: string]: (...args: any[]) => any},
// // > {
// //   shouldFreeze: boolean;
// //   // dispatch: <C extends keyof Actions>(action: C, payload?: unknown) => void;
// // }
// //
// //
// // // A decorator function which replicates the mixin pattern:
// // function StoreDecorator<
// //   O extends Options<any>,
// //   // Actions = O extends Options<infer A> ? ValuesType<A> : never,
// // >(opts: Options<any>) {
// //   return <
// //     T extends Class<Base<any>
// //   >,
// //     // Store = T extends Base<infer S, Actions> ? S : never
// //   >(target: T) => {
// //
// //     return class extends target {
// //       shouldFreeze = false;
// //
// //     };
// //   };
// // }
//
//
//
// function Effect<Actions>(action: keyof Actions) {
//   return (target, key) => {
//
//   };
// }
//
// function Reduce<Actions>(action: keyof Actions): MethodDecorator {
//   return <B extends Base<any, any>, T>(target: B, methodName: string | symbol, descriptor) => {
//       return descriptor as TypedPropertyDescriptor<T>;
//   };
// }
//
// function ReduceProperty<Actions>(action: keyof Actions): PropertyDecorator {
//   return (target, propertyKey) => {
//
//
//   };
// }
//
// interface MyActions extends Act {
//   findAll: () => Observable<string[]>;
//   findOne: (id: string) => Observable<string>;
//   reduceOnly: () => Observable<number>;
//   queryBy: (id: string, type: 'A' | 'B') => Observable<string[]>;
//   effectWithObjectParam: (param: { id: string; email: string; age: number }) => Observable<string[]>;
// }
//
// interface PlayerState {
//   users: string[];
// }
//
// // @StoreDecorator({
// //   actions: [1, 2]
// // })
// class Player extends Base<PlayerState, MyActions> {
//
//   @ReduceProperty<MyActions>('reduceOnly')
//   onReduceOnly = this.reduce('reduceOnly', (state, response) => {
//     return {
//       ...state,
//       users: state.users.slice(0, response)
//     };
//   });
//
//   @ReduceProperty<MyActions>('findOne')
//   _onFindAOne: Reducer<MyActions, 'findOne'> = (state: PlayerState, payload) => {
//     return {
//       users: [...state.users, payload]
//     };
//   }
//
//
//   @Effect<MyActions>('findAll')
//   findAll(): Observable<string[]> {
//     return undefined;
//   }
//
//   findOne(id: string): Observable<string> {
//     return undefined;
//   }
//
//   @Reduce<MyActions>('findAll')
//   onFindAll(actions, state) {
//     this.reduce('findAll');
//   }
//
//
//
//
//   @Effect<MyActions>('queryBy')
//   queryBy(id: string, type: 'A' | 'B'): Observable<string[]> {
//     return undefined;
//   }
//
//
//
//   // @Reduce<MyActions>('findAll')
//   // reduce(state: unknown, payload: unknown) {
//   //
//   // }
//
//
//   // reduce(action: 'findAll', state: unknown, response: R) {
//   //   super.reduce(action, state, response);
//   // }
// }
//
//
//
// const playerTwo = new Player();
// playerTwo.dispatch('findAll');
// playerTwo.dispatch('findOne', 'id');
// playerTwo.dispatch('reduceOnly');
// playerTwo.dispatch('queryBy', 'test', 'A');
// playerTwo.dispatch('effectWithObjectParam', {
//   id: 'test',
//   email: 'test',
//   age: 22
// });
//
// playerTwo.reduce('reduceOnly', (state, response) => {
//   return state;
// });
// playerTwo.reduce('findOne', (state, response) => {
//   state.users.push(response);
//   return state;
// });
//
//
// namespace SuperStore {
//
//   export function Decorator<Actions, O extends {}>(_options?: O) {
//     return (target) => {
//
//     };
//   }
//
// }
//
// const superOptions: {
//   status: string[];
// } = {
//   status: ['a', 'b']
// };
//
// @SuperStore.Decorator<MyActions, {
//   status: string[];
// }>(superOptions)
// class TestSuperStore {
//
//
// }

