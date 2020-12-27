// import { Actions, BaseStore, getPayloadFromActionType, getResponseFromActionType } from '../base-store';
// import { Observable } from 'rxjs';
//
// class TestStore<
//   Store extends BaseStore<any, any>,
//   A = Store extends BaseStore<any, infer Acts> ? Acts : never,
//
// > {
//
//   // tslint:disable-next-line:no-shadowed-variable
//   constructor(store: Store) {
//   }
//
//   effect<C extends keyof A>(action: C, ...payload: getPayloadFromActionType<A, C>) {}
// }
//
// export function expectEffect<
//   Store extends BaseStore<any, any>,
//   // A extends Actions,
//   C extends keyof A,
//   A = Store extends BaseStore<any, infer Acts> ? Acts : never,
//   // A = _Actions extends Actions ? _Actions : Actions,
// // tslint:disable-next-line:no-shadowed-variable
// >(store: Store, action: C, payload: getPayloadFromActionType<A, C>) {
//
//
// }
//
//
// interface MyActions extends Actions {
//   one: () => Observable<string[]>;
//   two: (id: string) => Observable<string>;
// }
//
// class MyStore extends BaseStore<any, MyActions> {}
//
// const store = new MyStore();
//
// expectEffect(store, '')
//
//
// const tester = new TestStore(store);
//
// tester.effect('two')
//
// // expectEffect<MyStore, MyActions>(store, 'one');
//
// // export function expectReducer<
// //   Store extends BaseStore<any, any>,
// //   State = Store extends BaseStore<infer S, any> ? S : never,
// //   A = Store extends BaseStore<any, infer Acts> ? Acts extends Actions ? Acts : never : never,
// //   C = A extends Actions ? keyof A : never,
// // >(store: Store, action: C, state: State, payload: getResponseFromActionType<A, C>) {
// //
// // }
//
//
// // import { BaseStore } from '../base-store';
// // import { $ElementType, $PropertyType, ValuesType } from 'utility-types';
// //
// // // export function testEffect<Actions extends string|number>(effect: Actions, store: object) {
// // //   console.log('will test', effect);
// // //   console.log(getStoreMetadata(store));
// // //
// // //   const effectsMetadata = Reflect.getMetadata('@Effect', store) || {};
// // //
// // //   console.log('Effects', effectsMetadata);
// // //
// // //
// // //   return effect;
// // // }
// //
// // type Enum = string | number;
// //
// // export class TestBed<T extends {
// //   actions: any;
// // }, K =  $ElementType<T, 'actions'>> {
// //
// //   constructor() {
// //
// //   }
// //
// //   public testEffect({name}: {name: K}) {
// //     console.log('effect name', name);
// //   }
// //
// //
// // }
// //
// // export type ArgTypes<T> = {
// //   [K in keyof T]: T[K] extends (...args: infer P) => any ? Parameters<T[K]> : never;
// // }[keyof T];
// //
// // export type MyReturnType<T> = {
// //   [K in keyof T]: T[K] extends (...args: infer P) => infer R ? R : never;
// // }[keyof T];
// //
// // export class MyBaseClass<T, ax extends {}, K = keyof ax, P = ValuesType<ArgTypes<ax>>> {
// //
// //   dispatch(action: K, args: P): void {
// //     console.log('dispatching', action);
// //     console.log('args are', args);
// //   }
// // }
// //
// // type extractGeneric<T> = T extends MyBaseClass<any, infer U> ? U : never;
// //
// //
// // // tslint:disable-next-line:ban-types
// // export function runEffect<T extends MyBaseClass<any, any>>(store: T, name: $PropertyType<ArgTypes<T>, 0> , args?: $PropertyType<ArgTypes<T>, 1>) {
// //
// //   // const effectsMetadata = getEffectsMetadata(store);
// //   // console.log({effectsMetadata});
// //
// //   // @ts-ignore
// //   return store[name].apply(store, [args]);
// // }
// // export function expectEffect<T extends BaseStore<any>>(store: T, action, payload) {
// //
// //
// //
// // }
