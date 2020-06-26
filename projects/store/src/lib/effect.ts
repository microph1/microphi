import { getDebugger } from '@microgamma/loggator';
import { BaseStore } from './base-store';

export function Effect(onAction: number) {

  return <Store extends BaseStore<any>>(target: Store, key: string) => {

    const d = getDebugger(`microphi:@Effect:${target.constructor.name}`);

    d('decorating', key, 'with type', onAction);

    const effects = Reflect.getMetadata('@Effect', target) || {};

    effects[onAction] = key;

    return Reflect.defineMetadata('@Effect', effects, target);
  };
}
