import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microphi:@Action');

export function Action() {
  return (target, key) => {
    d('action decorator for', key);


    const action = key; //new Actions<number>(key); //createAction(key);
    d('action created', action);

    const actions = Reflect.getMetadata('Actions', target) || [];

    actions.push(action);


    d('actions so far', actions);

    Reflect.defineMetadata(`Actions`, actions, target);

  }
}
