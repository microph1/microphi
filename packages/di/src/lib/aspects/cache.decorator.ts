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
 * concurrent callers share the same pending call, and a rejected/errored result is cached too.
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

        const retValue = originalFn.apply(this, args);
        cache.set(id, { value: retValue, timestamp: now });
        return retValue;

      };
    }

  };
}
