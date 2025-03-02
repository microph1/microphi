import 'reflect-metadata';

const ViewChildSymbol = Symbol('@ViewChild');

export function ViewChild(selector: string) {
  return (target, property) => {
    const inputs = getViewChildMetadata(target.constructor) || [];
    inputs.push({property, selector});
    Reflect.defineMetadata(ViewChildSymbol, inputs, target.constructor);
  };
}

export function getViewChildMetadata(constructor): {property: string; selector: string;}[] {
  return Reflect.getMetadata(ViewChildSymbol, constructor);
}
