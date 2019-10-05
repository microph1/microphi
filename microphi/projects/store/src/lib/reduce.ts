export function Reduce(onAction: string) {
  return (target, key, descriptor) => {

    const reducer = Reflect.getMetadata('Reducer', target) || {};

    reducer[onAction] = key;

    Reflect.defineMetadata('Reducer', reducer, target);

    return descriptor;
  };
}
