import { TestScheduler } from '@datakitchen/rxjs-marbles';
import { Observable, delay, of } from 'rxjs';
import { Effect } from '../effect/effect';
import { Reduce } from '../reduce/reduce';
import { Store } from '../store/store';
import { DelayTime, getDelay, getDelayTimeMetadata } from './delay';

describe('@DelayTime aka rate-limit', () => {

  interface State {
    items: string[],
  }

  interface Actions {
    delayedMethod(id: string): Observable<string>;
    useDecorator(id: string): Observable<string>;

    useSwitchMap(id: string): Observable<string>;

    useMergeMap(id: string): Observable<string>;
  }

  class TestClass extends Store<State, Actions> {

    @Effect('concatMap')
    delayedMethod(id: string) {

      return of(id).pipe(
        delay(100),
      );
    }

    @Reduce()
    onDelayedMethod(state: State, payload: string): State {
      return {...state, items: [...state.items, payload]};
    }


    @Effect('concatMap')
    @DelayTime(100)
    useDecorator(id: string) {

      return of(id);
    }

    @Reduce()
    onUseDecorator(state: State, payload: string): State {
      return {...state, items: [...state.items, payload]};
    }


    @Effect('switchMap')
    @DelayTime(100)
    useSwitchMap(id: string) {

      return of(id);
    }

    @Reduce()
    onUseSwitchMap(state: State, payload: string): State {
      return {...state, items: [...state.items, payload]};
    }

    @Effect('mergeMap')
    @DelayTime(100)
    useMergeMap(id: string) {

      return of(id);
    }

    @Reduce()
    onUseMergeMap(state: State, payload: string): State {
      return {...state, items: [...state.items, payload]};
    }

  }

  let instance: TestClass;
  let scheduler: TestScheduler;

  beforeEach(() => {

    scheduler = new TestScheduler();
    instance = new TestClass({ items: [] }, scheduler);

  });

  it('should exists', () => {
    expect(instance).toBeTruthy();
  });

  describe('read and write metadata', () => {
    it('should store metadata', () => {
      expect(getDelayTimeMetadata(TestClass, 'useDecorator')).toEqual(100);
    });

    it('should get metadata from instance', () => {
      expect(getDelay(instance, 'useDecorator')).toEqual(100);
    });

  });


  describe('manually use delay to "rate-limit" an effect', () => {

    it('should "rate limit" a method', () => {

      scheduler.run(({expectObservable}) => {

        instance.dispatch('delayedMethod', 'id1');
        instance.dispatch('delayedMethod', 'id2');
        instance.dispatch('delayedMethod', 'id3');
        instance.dispatch('delayedMethod', 'id4');

        expectObservable(instance.state$).toBe('a 99ms b 99ms c 99ms d 99ms e', {
          a: {items: []},
          b: {items: ['id1']},
          c: {items: ['id1', 'id2']},
          d: {items: ['id1', 'id2', 'id3']},
          e: {items: ['id1', 'id2', 'id3', 'id4']},

        });
      });

    });

  });

  describe('use @DelayTime for "rate-limit" an effect with "concatMap"', () => {

    it('should "rate limit" a method', () => {

      scheduler.run(({expectObservable}) => {

        instance.dispatch('useDecorator', 'id1');
        instance.dispatch('useDecorator', 'id2');
        instance.dispatch('useDecorator', 'id3');
        instance.dispatch('useDecorator', 'id4');

        expectObservable(instance.state$).toBe('a 99ms b 99ms c 99ms d 99ms e', {
          a: {items: []},
          b: {items: ['id1']},
          c: {items: ['id1', 'id2']},
          d: {items: ['id1', 'id2', 'id3']},
          e: {items: ['id1', 'id2', 'id3', 'id4']},

        });
      });

    });

  });

  describe('use @DelayTime for "rate-limit" an effect with "switchMap"', () => {
    // Using switchMap will naturally cancel any previous call

    it('should "rate limit" a method', () => {

      scheduler.run(({expectObservable}) => {

        instance.dispatch('useSwitchMap', 'id1');
        instance.dispatch('useSwitchMap', 'id2');
        instance.dispatch('useSwitchMap', 'id3');
        instance.dispatch('useSwitchMap', 'id4');

        expectObservable(instance.state$).toBe('a 99ms b', {
          a: {items: []},
          b: {items: ['id4']},
        });
      });

    });

  });


  describe('use @DelayTime for "rate-limit" an effect with "mergeMap"', () => {

    // using mergeMap will group all subsequent call

    it('should "rate limit" a method', () => {

      scheduler.run(({expectObservable}) => {

        instance.dispatch('useMergeMap', 'id1');
        instance.dispatch('useMergeMap', 'id2');
        instance.dispatch('useMergeMap', 'id3');
        instance.dispatch('useMergeMap', 'id4');

        expectObservable(instance.state$).toBe('a 99ms (b c d e)', {
          a: {items: []},
          b: {items: ['id1']},
          c: {items: ['id1', 'id2']},
          d: {items: ['id1', 'id2', 'id3']},
          e: {items: ['id1', 'id2', 'id3', 'id4']},
        });
      });

    });

  });

});
