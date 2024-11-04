import 'reflect-metadata';
import { Class } from 'utility-types';
import { scanInstance } from '../utilities/scan-instance';
import { Store } from '../store/store';
import { Fn, Key } from '../store/types';
import { MonoTypeOperatorFunction, debounceTime, identity } from 'rxjs';

const DebounceSymbol = Symbol.for('@DebounceTime');


/**
 * Add a debounce to each dispatch of this action
 */
export function DebounceTime(time: number) {

  return <T extends Fn, S extends Store<any, any>>(target: S, key: Key, descriptor: TypedPropertyDescriptor<T>) => {
    Reflect.defineMetadata(DebounceSymbol, time, target, key);
    return descriptor;
  };
}

export function getDebounceTimeMetadata<T>(klass: Class<T>, key: string) {
  return Reflect.getMetadata(DebounceSymbol, klass.prototype, key);
}

export function getDebounceTimeMetadataFromInstance(instance: object, key: string) {
  let debounce = 0;

  scanInstance(instance, (proto) => {
    debounce = Reflect.getMetadata(DebounceSymbol, proto, key);
  });

  return debounce;
}

export function getDebounce<T extends object>(instance: T, key: string): number {

  let debounce = 0;

  scanInstance(instance, (proto) => {

    const value = Reflect.getMetadata(DebounceSymbol, proto, key);

    if (value) {
      debounce = value;
    }
  });

  return debounce;
}

export function debounceOrNothing<T>(dueTime: number): MonoTypeOperatorFunction<T> {
  return dueTime ? debounceTime(dueTime) : identity;
}
