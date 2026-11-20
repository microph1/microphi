/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable } from 'rxjs';

// `@Cache` lives in `@microphi/di` so that it can be used on any class.
// It is re-exported here to keep the store's public API unchanged.
export { Cache, CacheClockSymbol, CacheSymbol } from '@microphi/di';
export type { CacheClock, CacheEntry, CacheMap, CacheOptions } from '@microphi/di';

export type EffectMethod = (...args: any[]) => Observable<any>;
