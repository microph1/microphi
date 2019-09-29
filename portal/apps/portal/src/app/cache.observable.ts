import { Observable, defer, isObservable, of } from 'rxjs';
import { shareReplay, first, mergeMap } from 'rxjs/operators';

let returnObs$: Observable<any>;
const createReturnObs = (obs: Observable<any>, time: number, bufferReplays: number) =>
  (returnObs$ = obs.pipe(shareReplay(bufferReplays, time)));

export function renewAfterTimer(obs: Observable<any>, time: number, bufferReplays: number = 1) {
  return createReturnObs(obs, time, bufferReplays).pipe(
    first(null, defer(() => createReturnObs(obs, time, bufferReplays))),
    mergeMap(d => (isObservable(d) ? d : of(d))),
  );
}
