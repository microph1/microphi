import { getDebugger } from '@microgamma/loggator';
import { createAction } from './actions';
import { ActionMetadata } from './action';
import { BaseStore } from './base-store';

export const StoreMetadata = '@Store';

export interface StoreOptions {
  initialState: any;
  name: string;
  actions: any;
}

export function Store(options: StoreOptions) {

  const d = getDebugger(`microphi:@Store:${options.name}`);

  return (target) => {

    d('running store decorator');

    const actions = {};

    if (options.actions) {

      for (let action in options.actions) {
        // actions is an enum: only parse numeric fields
        if (+action >= 0) {
          d('parsing type', action);

          actions[action] = createAction(options.actions[action]);
        } else {
          // we can parse action names here. action is a string
          d('parsing action', action);
          actions[action] = [`${action}_REQUEST`, `${action}_RESPONSE`];
        }


      }

      d('actions are', actions);
    }

    Reflect.defineMetadata(StoreMetadata, options, target);
    Reflect.defineMetadata(ActionMetadata, actions, target);
  }
}

export function getStoreMetadata(instance): StoreOptions {
  return Reflect.getMetadata(StoreMetadata, instance.constructor);
}


