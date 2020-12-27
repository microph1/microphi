import { BehaviorSubject, iif, Observable, of, partition, Subject } from 'rxjs';
import { concat, concatMap, map, mapTo, mergeMap, mergeScan, multicast, scan, switchMap, switchMapTo } from 'rxjs/operators';
import { StoreOptions } from './store';
import { Class } from 'utility-types';
import { BaseStore } from './base-store';

export type Enum = string | number;

export interface ActionSubject<Actions> {
  action: Actions;
  payload?: any;
  type?: 'request' | 'response';
}

type ActionNames<T extends {}> = {
  [K in keyof T]: K
}[keyof T];

type PayloadTypes<T extends {}> = {
  [K in keyof T]: T[K]
}[keyof T];
//
// export function Store(options: StoreOptions) {
//   return <T extends Class<any>>(target: T) {
//
//     return target extends BaseStore<any> {
//
//     }
//   }
// }
