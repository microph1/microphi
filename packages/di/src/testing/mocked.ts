import { Instance, Klass } from '../lib/types';
import Mock = jest.Mock;
import FunctionPropertyNames = jest.FunctionPropertyNames;
import { FunctionKeys } from 'utility-types';


const MockedSymbol = Symbol('Mocked');

export type MockedOptions<InstanceType extends object> = Partial<Record<FunctionKeys<InstanceType>, Mock|'NO_MOCK'>>;

export const Mocked = <BaseClass extends Klass, K extends object = InstanceType<BaseClass>>(
  base: BaseClass,
  options: MockedOptions<K> = {},
): BaseClass =>

  class {
    [MockedSymbol] = true;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(...ops: any[]) {

      const methods = [...getPropertyNames(base.prototype)];

      methods
        .forEach((m) => {
          if (m in options) {
            if (options[m] === 'NO_MOCK') {
              this[m] = base.prototype[m];
            }

            if (options[m] !== 'NO_MOCK' && typeof options[m] === 'function') {
              this[m] = options[m];
            }
          } else {
            this[m] = jest.fn();
          }
        });
    }
  } as BaseClass;

export type WithMock<T> = T & Record<FunctionPropertyNames<T>, Mock>;


function *getPropertyNames(instance: Instance) {
  const internals = ['constructor', '__defineGetter__',
    '__defineSetter__',
    'hasOwnProperty',
    '__lookupGetter__',
    '__lookupSetter__',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toString',
    'valueOf',
    'toLocaleString'
  ];

  while (instance) {

    const methods = Object.getOwnPropertyNames(instance)
      .filter((property) => {
        return typeof instance[property] === 'function';
      })
      .filter((p) => !internals.includes(p));

    for (const method of methods) {
      yield method;
    }

    instance = Object.getPrototypeOf(instance);
  }
}
