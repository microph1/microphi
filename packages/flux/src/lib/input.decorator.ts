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
