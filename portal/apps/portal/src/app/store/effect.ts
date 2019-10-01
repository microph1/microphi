import { getDebugger } from '@microgamma/loggator';
const d = getDebugger('microphi:Effect');


/**
 * Should hijack the decorated method so that the returned observable is piped
 * @param onAction
 * @param dispatchAction
 * @constructor
 */
export function Effect(onAction: string, dispatchAction: string) {

  return (target, key, descriptor) => {

    d('running effect for', target, key);

    const effects = Reflect.getMetadata('@Effect', target) || {};

    const effectsForThisAction = effects[onAction] || [];
    effectsForThisAction.push(key);

    effects[onAction] = effectsForThisAction;



    // originalFn should return an observable
    const originalFn = descriptor.value;

    descriptor.value = function(...args) {

      d(`running Effect for ${key} with`, args);

      originalFn.apply(this, args).subscribe((resp) => {
        // pass response down triggering event to alert data arrived
        d('got data', resp);
        this.dispatch(dispatchAction, resp);
      }, (err) => {
        // dispatch event with error
        d('got error', err);
        this.dispatch(`${onAction}:Error`, err);

      });

    };

    return Reflect.defineMetadata('@Effect', effects, target);
  }
}
