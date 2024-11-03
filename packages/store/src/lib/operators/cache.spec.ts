import { TestScheduler } from '@datakitchen/rxjs-marbles';
import { Observable, of } from 'rxjs';
import { Effect } from '../effect/effect';
import { Reduce } from '../reduce/reduce';
import { Store } from '../store/store';
import { Cache } from './cache';

describe('@Cache', () => {

  const spy = jest.fn();

  interface State {
    items: string[],
  }

  interface Actions {
    cachedMethod(): Observable<string>;

    // this is to simultate an action that takes arguments
    getBy(part: string, parts: string[]): Observable<string>;

    // this is to test an action that has arguments and we provide `trackBy`
    // to control how caching is checked
    getByNames(names: string[]): Observable<string>;
  }

  class TestClass extends Store<State, Actions> {
    private index = 0;

    @Effect()
    @Cache({ ttl: 10 })
    cachedMethod() {
      spy();

      return of(String(this.index++));
    }

    @Reduce()
    onCachedMethod(state: State, payload: string): State {
      return {...state, items: [payload]};
    }

    @Effect()
    @Cache({ ttl: 10 })
    getBy(part: string, parts: string[]): Observable<string> {
      spy();
      const result = parts.find((p) => p.includes(part));
      return of(result || '');
    }

    @Reduce()
    onGetBy(state: State, payload: string): State {
      return {...state, items: [payload]};

    }

    @Effect()
    @Cache({ ttl: 10, trackBy: (names: string[]) => names.length })
    getByNames(names: string[]) {
      spy();

      return of(String(names.length));
    }

    @Reduce()
    onGetByNames(state: State, payload: string): State {

      return {...state, items: [payload]};
    }
  }

  let instance: TestClass;
  let scheduler: TestScheduler;

  beforeEach(() => {

    instance = new TestClass({ items: [] });
    scheduler = new TestScheduler();
    spy.mockReset();

  });

  it('should exists', () => {
    expect(instance).toBeTruthy();
  });

  describe('caching a simple action (i.e. no arguments)', () => {

    it('should call only once', () => {


      scheduler.run(({expectObservable}) => {

        instance.dispatch('cachedMethod');
        instance.dispatch('cachedMethod');
        instance.dispatch('cachedMethod');
        instance.dispatch('cachedMethod');

        expect(spy).toHaveBeenCalledTimes(1);

        expectObservable(instance.state$).toBe('a', {
          a: {items: ['0']}
        });
      });

    });

    it('should call the method if ttl is expired', async () => {

      instance.dispatch('cachedMethod');

      await new Promise((resolve) => {

        setTimeout(() => {
          resolve(true);
        }, 300);
      });

      instance.dispatch('cachedMethod');

      expect(spy).toHaveBeenCalledTimes(2);

      scheduler.expect$(instance.state$).toContain({items: ['1']});
    });

  });


  describe('caching an action with arguments', () => {

    /**
      * When trackBy is not provided `JSON.strigify` is used to serialize the arguments
      */
    describe('automatic trackBy', () => {

      it('should call only once', () => {

        scheduler.run(({expectObservable}) => {

          instance.dispatch('getBy', 'alice', ['bob', 'alice', 'renoult']);
          instance.dispatch('getBy', 'alice', ['bob', 'alice', 'renoult']);

          expect(spy).toHaveBeenCalledTimes(1);

          expectObservable(instance.state$).toBe('a', {
            a: {items: ['alice']}
          });
        });

      });

      it('should call the method if ttl is expired', async () => {

        instance.dispatch('getBy', 'alice', ['bob', 'alice', 'renoult']);

        await new Promise((resolve) => {

          setTimeout(() => {
            resolve(true);
          }, 300);
        });

        instance.dispatch('getBy', 'alice', ['bob', 'alice', 'renoult']);

        expect(spy).toHaveBeenCalledTimes(2);

        scheduler.expect$(instance.state$).toContain({items: ['alice']});
      });


      it('should call the method if arguments change', () => {

        scheduler.run(({expectObservable}) => {

          instance.dispatch('getBy', 'alice', ['bob', 'alice', 'renoult']);
          instance.dispatch('getBy', 'alice', ['alice', 'bob', 'renoult']);

          expect(spy).toHaveBeenCalledTimes(2);

          expectObservable(instance.state$).toBe('a', {
            a: {items: ['alice']}
          });
        });
      });

    });


    describe('custom trackBy', () => {

      it('should call only once', () => {

        scheduler.run(({expectObservable}) => {

          instance.dispatch('getByNames', ['bob', 'alice', 'renoult']);
          instance.dispatch('getByNames', ['alice', 'bob', 'renoult']);

          expect(spy).toHaveBeenCalledTimes(1);

          expectObservable(instance.state$).toBe('a', {
            a: {items: ['3']}
          });
        });

      });

      it('should call the method if ttl is expired', async () => {

        instance.dispatch('getByNames', ['bob', 'alice', 'renoult']);

        await new Promise((resolve) => {

          setTimeout(() => {
            resolve(true);
          }, 300);
        });

        instance.dispatch('getByNames', ['bob', 'alice', 'renoult']);

        expect(spy).toHaveBeenCalledTimes(2);

        scheduler.expect$(instance.state$).toContain({items: ['3']});
      });


      it('should call the method if arguments change', () => {

        scheduler.run(({expectObservable}) => {

          instance.dispatch('getByNames', ['bob', 'alice', 'renoult']);
          instance.dispatch('getByNames', ['alice', 'bob', 'renoult', 'fiat']);

          expect(spy).toHaveBeenCalledTimes(2);

          expectObservable(instance.state$).toBe('a', {
            a: {items: ['4']}
          });
        });
      });

    });

  });

});
