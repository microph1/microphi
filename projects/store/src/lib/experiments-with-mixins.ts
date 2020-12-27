import { EffectFn, PureReducerFn } from './dispatcher/dispatcher';
import { Class, FunctionKeys, PickByValue } from 'utility-types';
import { Observable, Subject } from 'rxjs';

type PasArray<P> = P extends any[] ? P : [P];
type Constructor = new (...args: any[]) => {};

function Scale<
  Actions extends {  },
  State,
  Effects = PickByValue<Actions, EffectFn<any, any>>
>(state: State) {
  // @ts-ignore
  return class Scaling implements Actions {
    // Mixins may not declare private/protected properties
    // however, you can use ES2020 private fields
    _state = state;
    actions: keyof Actions;

    dispatch<C extends keyof Effects>(action: C) {}

  };
}


interface MyActions {
  findAll: EffectFn<void, string[]>;
  select: EffectFn<void, string>;
}

class BaseStore<State> {}

class MyStore extends BaseStore<string[]> implements MyActions {
  findAll(args: void): Observable<string[]> {
    return undefined;
  }

  select(args: void): Observable<string> {
    return undefined;
  }

}

function StoreFactory<Actions, T extends Class<BaseStore<any>>>(Base: T) {
  return class extends Base {
    protected actions$: Map<keyof Actions, Subject<any>> = new Map();


    constructor(...args: any[]) {
      super();

      const descriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(this));

      // console.log({descriptors});
      Object.keys(descriptors)
        .filter(name => name !== 'constructor')
        .filter(name => !name.startsWith('on'))
        .forEach((action) => {

          console.log('setting subject for', action);

          // @ts-ignore
          this.actions$.set(action, new Subject<any>());

        });
    }

    public dispatch<C extends keyof PickByValue<Actions, EffectFn<any, any> | PureReducerFn<any, any>>,
      >(
      action: C,
      ...payload: Actions[C] extends EffectFn<any, any> ?
        Parameters<Actions[C]> :
        Actions[C] extends PureReducerFn<infer P, any> ?
          PasArray<P> : never[]
    ) {

      if (!this.actions$.has(action)) {
        throw new Error(`Cannot find action ${action}`);
      }

      this.actions$.get(action).next({name: 'effectName' || 'noopEffect', payload});
    }

  };
}

const StoreImpl = StoreFactory<MyActions, Class<MyStore>>(MyStore);
const store = new StoreImpl();

store.dispatch('findAll');

