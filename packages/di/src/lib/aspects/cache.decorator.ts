/* eslint-disable @typescript-eslint/no-explicit-any */
export const CacheSymbol = Symbol('@Cache');

export interface CacheEntry {
  timestamp: number;
  value: unknown;
}

export type CacheMap = Map<string, CacheEntry>;

export interface CacheOptions {
  /**
   * time to live in milliseconds
   */
  ttl?: number;
  /**
   * This function has the same arguments as the decorated method
   */
  trackBy?: (...args: any[]) => string|number;
  /**
   * Keep a rejected `Promise` / errored `Observable` in the cache for the ttl.
   * With `false` the entry is evicted when it fails, so the next call runs again.
   * Default `true`.
   */
  cacheErrors?: boolean;
}

interface ObservableLike {
  subscribe(observer: { next(v: unknown): void; error(e: unknown): void; complete(): void }): { unsubscribe(): void };
  pipe(...fns: unknown[]): unknown;
}

function isObservable(value: any): value is ObservableLike {
  return typeof value?.subscribe === 'function' && typeof value?.pipe === 'function';
}

/**
 * di does not depend on rxjs, so the wrapper is built with the value's own base
 * class: the topmost constructor in its prototype chain below `Object` (rxjs
 * `Observable` for a `Subject`, a `BehaviorSubject`, ...), which takes a subscribe function.
 */
function onObservableError(source: ObservableLike, onError: () => void): unknown {
  let proto = Object.getPrototypeOf(source);
  while (Object.getPrototypeOf(proto) && Object.getPrototypeOf(proto) !== Object.prototype) {
    proto = Object.getPrototypeOf(proto);
  }
  const ObservableCtor = proto.constructor as new (subscribe: (subscriber: any) => () => void) => unknown;

  return new ObservableCtor((subscriber) => {
    const subscription = source.subscribe({
      next: (v) => subscriber.next(v),
      error: (e) => { onError(); subscriber.error(e); },
      complete: () => subscriber.complete(),
    });
    return () => subscription.unsubscribe();
  });
}

/**
 * Where `@Cache` reads the time from, instead of `Date`: set it on the instance
 * to put the ttl on a scheduler's clock (an rxjs `SchedulerLike` fits, a
 * `TestScheduler` makes it virtual).
 */
export const CacheClockSymbol = Symbol('@Cache clock');

export interface CacheClock {
  now(): number;
}

interface Cacheable {
  [CacheSymbol]?: CacheMap;
  [CacheClockSymbol]?: CacheClock;
}

/**
 * Caches the value returned by the annotated method
 *
 * @remarks
 * The returned value itself is cached, so when the method returns a `Promise` or an `Observable`
 * concurrent callers share the same pending call, and a rejected/errored result is cached too
 * unless `cacheErrors: false`.
 * The cache lives on the instance under `CacheSymbol` and is created on first call.
 *
 * @example
 * ```typescript
 * class SongDb {
 *
 *   @Cache({ ttl: 60_000, trackBy: (id: string) => id })
 *   async fetchCoverArt(id: string) {
 *     return fetch(`/cover/${id}`);
 *   }
 * }
 * ```
 */
export function Cache(options?: CacheOptions): MethodDecorator {

  return (_target, property, descriptor: PropertyDescriptor) => {
    const originalFn = descriptor.value;
    if (originalFn) {

      descriptor.value = function(this: Cacheable, ...args: any[]) {

        const cache = this[CacheSymbol] ??= new Map();

        // this can grow huge
        // shall we put some sort of cap?
        const key = options?.trackBy ? options.trackBy(...args) : JSON.stringify(args);
        const id = `${String(property)}:${key}`;

        const cached = cache.get(id);
        const now = (this[CacheClockSymbol] ?? Date).now();

        if (cached) {

          // check ttl given timestamp
          const ttl = now - cached.timestamp;
          const maxTtl = options?.ttl || 300_000; // 5 minutes

          if (ttl <= maxTtl) {
            return cached.value;
          }

        }

        let retValue = originalFn.apply(this, args);
        const entry: CacheEntry = { value: retValue, timestamp: now };

        if (options?.cacheErrors === false) {
          // only evict our own entry: a later call may already have replaced it
          const evict = () => { if (cache.get(id) === entry) cache.delete(id); };

          if (typeof retValue?.then === 'function') {
            // a separate branch: the caller still gets the rejection, and it is not reported as unhandled
            retValue.then(undefined, evict);
          } else if (isObservable(retValue)) {
            retValue = entry.value = onObservableError(retValue, evict);
          }
        }

        cache.set(id, entry);
        return retValue;

      };
    }

  };
}
