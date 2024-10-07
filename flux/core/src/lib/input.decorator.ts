/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-return */
import 'reflect-metadata';

const InputSymbol = Symbol('@Input');

export function Input() {

  return (target, key) => {
    const inputs = getInputMetadata(target.constructor) || [];
    inputs.push(key);
    Reflect.defineMetadata(InputSymbol, inputs, target.constructor);
  };
}

export function getInputMetadata(constructor) {
  return Reflect.getMetadata(InputSymbol, constructor);
}
