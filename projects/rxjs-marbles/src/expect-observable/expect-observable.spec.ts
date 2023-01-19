import { BehaviorSubject, from, of } from 'rxjs';
import { expectObservable } from './expect-observable';


describe('expect-observable', () => {

  it('should match on an observable (.toBe)', () => {

    expectObservable(of(1)).toBe('(a|)', {a: 1});

  });

  it('should match on an observable (.toEqual)', () => {

    const source$ = new BehaviorSubject(1);
    expectObservable(source$).toEqual(1);

  });

  it('should match on an observable (.toContain)', () => {

    expectObservable(from([ 1, 2, 3 ])).toContain(2);

  });

});
