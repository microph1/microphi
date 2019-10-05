import { BaseStore } from './base-store';

export function Reduce(onAction: string) {
  return <Store extends BaseStore<any>>(target: Store, key: string, descriptor: PropertyDescriptor) => {

    const reducer = Reflect.getMetadata('Reducer', target) || {};

    reducer[onAction] = key;

    Reflect.defineMetadata('Reducer', reducer, target);

    return descriptor;
  };
}
