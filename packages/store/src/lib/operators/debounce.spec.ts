import { Observable, of } from 'rxjs';
import { Effect } from '../effect/effect';
import { Store } from '../store/store';
import { DebounceTime, getDebounce, getDebounceTimeMetadata } from './debounce';
import { Reduce } from '../reduce/reduce';
import { TestScheduler } from '@datakitchen/rxjs-marbles';

describe('@DebounceTime', () => {

  let scheduler: TestScheduler;

  interface State {
    items: string[],
  }

  interface Actions {
    debouncedMethod(id: string): Observable<string>;
  }

  class TestClass extends Store<State, Actions> {

    @DebounceTime(300)
    @Effect('switchMap')
    debouncedMethod(id: string) {
      return of(`${id}`);
    }

    @Reduce()
    onDebouncedMethod(state: State, payload: string) {
      return {
        ...state,
        items: [payload],
      };
    }

  }

  let instance: TestClass;

  beforeEach(() => {

    scheduler = new TestScheduler();
    instance = new TestClass({ items: [] });

  });

  it('should exists', () => {

    expect(instance).toBeTruthy();

  });

  it('should store metadata', () => {
    expect(getDebounceTimeMetadata(TestClass, 'debouncedMethod')).toEqual(300);
  });

  it('should get metadata from instance', () => {
    expect(getDebounce(instance, 'debouncedMethod')).toEqual(300);
  });

  describe('debounce a method', () => {

    it('should add a delay to each dispatch', () => {
      scheduler.run(({expectObservable}) => {

        instance.dispatch('debouncedMethod', 'id');
        instance.dispatch('debouncedMethod', 'id2');
        expectObservable(instance.state$).toBe('a 299ms b', {
          a: {items: []},
          b: {items: ['id2']}
        });
      });


    });


  });

});
