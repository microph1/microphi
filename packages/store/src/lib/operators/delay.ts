import 'reflect-metadata';
import { Class } from 'utility-types';
import { scanInstance } from '../utilities/scan-instance';
import { Store } from '../store/store';
import { Fn, Key } from '../store/types';
import { MonoTypeOperatorFunction, delay, identity } from 'rxjs';

const DelaySymbol = Symbol.for('@DelayTime');


/**
 * Add a delay to each dispatch of this action
 */
export function DelayTime(time: number) {

  return <T extends Fn, S extends Store<any, any>>(target: S, key: Key, descriptor: TypedPropertyDescriptor<T>) => {
    Reflect.defineMetadata(DelaySymbol, time, target, key);
    return descriptor;
  };
}

export function getDelayTimeMetadata<T>(klass: Class<T>, key: string) {
  return Reflect.getMetadata(DelaySymbol, klass.prototype, key);
}

export function getDelayTimeMetadataFromInstance(instance: object, key: string) {
  let debounce = 0;

  scanInstance(instance, (proto) => {
    debounce = Reflect.getMetadata(DelaySymbol, proto, key);
  });

  return debounce;
}

export function getDelay<T extends object>(instance: T, key: string): number {

  let delay = 0;

  scanInstance(instance, (proto) => {

    const value = Reflect.getMetadata(DelaySymbol, proto, key);

    if (value) {
      delay = value;
    }
  });

  return delay;
}

export function delayOrNothing<T>(delayTime: number): MonoTypeOperatorFunction<T> {
  return delayTime ? delay(delayTime) : identity;
}
