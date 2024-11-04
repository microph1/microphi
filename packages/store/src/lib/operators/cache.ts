/* eslint-disable @typescript-eslint/no-explicit-any */
import { Store } from '../store/store';
import { Observable } from 'rxjs';
import { Fn, Key } from '../store/types';
import 'reflect-metadata';

export const CacheSymbol = Symbol('@Cache');

export interface CacheOptions {
  /**
   * time to live in milliseconds
   */
  ttl?: number;
  /**
   * This function has the same arguments as the decorated method
   */
  trackBy?: (...args: any[]) => string|number;
}

export type EffectMethod = (...args: any[]) => Observable<any>;

/**
 * Caches an effect's value
 */
export function Cache(options?: CacheOptions) {

  return <S extends Store<any, any>>(_target: S, property: Key, descriptor: TypedPropertyDescriptor<Fn>) => {
    const originalFn = descriptor.value;
    if (originalFn) {

      descriptor.value = function(...args: any[]) {


        const root = this as Store<any, any>;

        const cache = root[CacheSymbol];

        // this can grow huge
        // shall we put some sort of cap?
        const key = options?.trackBy ? options.trackBy(...args) : JSON.stringify(args);
        const id = `${property as string}:${key}`;

        const cached = cache.get(id);

        if (cached) {

          // check ttl given timestamp
          const timestamp = cached.timestamp;
          const now = Date.now();
          const ttl = now - timestamp;
          const maxTtl = options?.ttl || 300_000; // 5 minutes

          if (ttl <= maxTtl) {

            const value = cached.value;
            return value;

          }

        }

        const retValue = originalFn.apply(this, args) as Observable<any>;
        cache.set(id, { value: retValue, timestamp: Date.now() });
        return retValue;

      };
    }

  };
}
