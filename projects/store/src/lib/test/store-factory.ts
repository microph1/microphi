// tslint:disable:ban-types
import { Class } from 'utility-types';
import { BaseStore } from '../base-store';


export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
export type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;

export type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export type NonFunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;

export type TypedStore<T extends BaseStore<any>> = T & FunctionProperties<T>;

export function StoreFactory<T extends Class<{}>>(base: T) {
  return class extends base {

  };

}
