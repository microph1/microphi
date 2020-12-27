import { Dispatcher, EffectFn, PureReducerFn, ReduceFn } from './dispatcher';
import { Observable } from 'rxjs';



fdescribe('dispatcher', () => {

  interface State {
    names: string[];
    selected?: {
      name: string;
      index: number;
    };
  }

  interface MyActions {
    findAll: EffectFn<void, string[]>;
    onFindAll: ReduceFn<string[], State>;

    /**
     * returns the index of the selected name
     */
    select: EffectFn<string, number>;

    onSelect: ReduceFn<string, State>;

    unselect: PureReducerFn<string, State>;

    // just to test a function that does have more than one argument
    reset: EffectFn<[string, number, boolean], boolean>;

    // test a function with an object as argument
    update: EffectFn<{ name: string, newName: string }, boolean>;
  }




  class Store extends Dispatcher<MyActions> implements MyActions {
    findAll(): Observable<string[]> {
      return undefined;
    }

    reset(name: string, index: number, flag: boolean): Observable<boolean> {
      return undefined;
    }

    select(name: string): Observable<number> {
      return undefined;
    }

    update({name, newName}: { name: string; newName: string }): Observable<boolean> {
      return undefined;
    }

    onFindAll(state: State, names: string[]): State {
      return undefined;
    }

    onSelect(state: State, name: string): State {
      return undefined;
    }

    unselect(state: State, name: string): State {
      return undefined;
    }

  }

  let store: Store;

  beforeEach(() => {

    store = new Store();

  });

  it('should ', () => {

    store.dispatch('findAll');
    store.dispatch('reset', 'name', 1, true);
    // store.dispatch('select', 'name');
    // store.dispatch('unselect', 'name');
    // store.dispatch('update', {
    //   name: 'name',
    //   newName: 'newName'
    // });


  });
});

