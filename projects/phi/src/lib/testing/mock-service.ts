import { Type } from '@angular/core';
import Spy = jasmine.Spy;
import createSpy = jasmine.createSpy;

export type Mock<T> = T & { [P in keyof T]: T[P] | Spy };

export function MockService<T>(type: Type<T>) {

  const proto = type.prototype;

  const methods = Object.getOwnPropertyNames(proto)
    .filter((m) => m !== 'constructor');

  return (target) => {
    const mockedClass = class {};

    console.log('mocking', target);
    methods.forEach((m) => {
      const descriptor = Object.getOwnPropertyDescriptor(proto, m);

      if (typeof descriptor.value === 'function') {
        console.log('spying on', m);
        mockedClass.prototype[m] = createSpy(m);
      }

    });

    return mockedClass;
  };
}
