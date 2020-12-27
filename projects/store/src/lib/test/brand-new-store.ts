import { Class, ValuesType } from 'utility-types';
import { BaseStore } from '../base-store';
import { StoreOptions } from '../store';

type Enum = any;

interface StoreDecoratorOptions {
  actions: Enum;
}

export class Store<State extends object> {
  private state: State;

  public dispatch(action: any, payload?: any) {
    console.log('base dispatch');
  }

}
//
// export function StoreDecorator<O extends StoreDecoratorOptions, Actions = Pick<O, 'actions'>>(options?: StoreDecoratorOptions) {
//   return <T extends Class<{}>>(Base: T) => {
//     return StoreFactory(Base, options.actions);
//
//   };
// }


export function StoreFactory<T extends Class<{}>, Actions>(Base: T, actions: Actions) {

  // console.log('---------------------------------');
  // console.log('show all methods of Base', Base);
  const methods = Object.getOwnPropertyNames(Base.prototype);
  // console.log('methods', methods);
  const descriptors = Object.getOwnPropertyDescriptors(Base);
  // console.log('descriptors', descriptors);
  // console.log('---------------------------------');


  return class extends Base {
    constructor(...args: any[]) {
      super(args);
    }

    // @ts-ignore
    Adispatch(action: 0, payload: string);
    Adispatch(action: Actions, payload?: any) {
      console.log('will call parent dispatch');
    }
  };

}

// export const StoreFactory2 = (options: StoreOptions) => class extends BaseStore<any> {
//
// };
