import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microphi:@Action');

export function Action(actionName: string) {
  return (target, key) => {
    d('action decorator for', key);

    target[key] = actionName;
    d('target[key]', target[key]);

    const action = actionName; //new Actions<number>(key); //createAction(key);
    d('action created', action);

    const actions = Reflect.getMetadata('Actions', target) || [];

    actions.push(action);


    d('actions so far', actions);

    Reflect.defineMetadata(`Actions`, actions, target);

  }
}
