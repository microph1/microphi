import { Observable, of } from 'rxjs';
import { Effect } from '../effect/effect';
import { Store } from '../store/store';
import { DebounceTime, getDebounce, getDebounceTimeMetadata } from './debounce';

describe('@DebounceTime', () => {

  interface State {
    items: [],
  }

  interface Actions {
    debouncedMethod(): Observable<string>;
  }

  class TestClass extends Store<State, Actions> {

    @DebounceTime(300)
    @Effect()
    debouncedMethod() {
      return of('hello');
    }

  }

  let instance: TestClass;

  beforeEach(() => {

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

});
