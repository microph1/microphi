import { getDebugger } from '@microgamma/loggator';

export function Effect(onAction: any, dispatchAction?: any, onErrorAction?: any) {

  return (target, key, descriptor) => {

    const d = getDebugger(`microphi:@AEffect:${target.constructor.name}`);

    d('decorating', key, 'with type', onAction);

    const effects = Reflect.getMetadata('@Effect', target) || {};

    effects[onAction] = key;

    return Reflect.defineMetadata('@Effect', effects, target);
  }
}
