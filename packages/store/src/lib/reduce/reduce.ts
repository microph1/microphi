import 'reflect-metadata';
import { scanInstance } from '../utilities/scan-instance';
import { Class } from 'utility-types';

export const ReduceSymbol = Symbol('@Reduce');

export interface Reducer {
  action: string;
}

export function Reduce(): MethodDecorator {
  return (target, propertyKey) => {
    // by convention a reducer have name such as onFindAll
    // where findAll is the associated action
    // with the following we extract the action's name
    const action = (propertyKey as string).slice(2, 3).toLowerCase() + (propertyKey as string).slice(3);

    return Reflect.defineMetadata(ReduceSymbol, action, target, propertyKey);
  };
}

export function getReduceMetadata(klass: Class<any>, key: string) {
  return Reflect.getMetadata(ReduceSymbol, klass, key);
}

export function getReducers(instance: object): {action: string;}[] {

  const reducers: {action: string;}[] = [];

  scanInstance(instance, (proto, key) => {

    const metadata = getReduceMetadata(proto, key);
    if (metadata) {
      reducers.push({action: metadata});
    }

  });

  return reducers;
}
