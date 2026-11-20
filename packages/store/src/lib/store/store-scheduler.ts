import { Injectable, injector, providers } from '@microphi/di';
import { asyncScheduler, SchedulerLike } from 'rxjs';

/**
 * The scheduler stores keep time on: `@DebounceTime`, `@DelayTime` and the ttl of
 * `@Cache`. rxjs's `asyncScheduler` unless one is provided, so a test controls
 * every store's time by providing a `TestScheduler`:
 *
 * ```typescript
 * TestBed.configure({ providers: [{ provide: StoreScheduler, useClass: TestScheduler }] });
 * const scheduler = injector(StoreScheduler) as TestScheduler;
 * ```
 */
@Injectable()
export abstract class StoreScheduler implements SchedulerLike {
  abstract now(): number;
  abstract schedule: SchedulerLike['schedule'];
}

/** the provided `StoreScheduler`, or rxjs's `asyncScheduler` */
export function storeScheduler(): SchedulerLike {
  return providers.hasInjectable(StoreScheduler) ? injector(StoreScheduler) : asyncScheduler;
}
