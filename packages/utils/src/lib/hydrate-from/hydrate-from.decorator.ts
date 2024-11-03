/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

export function readFromStorage<T = unknown>(storage: Storage, namespace: string, parser?: (v: string) => T): T {
  const value = storage.getItem(namespace) || 'false';

  if (parser) {
    return parser(value);
  }
  return JSON.parse(value) || undefined;
}

export function writeToStorage<T = unknown>(storage: Storage, key: string, value: T, serializer?: (v: T) => string) {
  const serialized = serializer ? serializer(value) : JSON.stringify(value);
  storage.setItem(key, serialized);
}

export function HydrateFrom(storage: Storage, options?: {
  parser?: (v: string) => unknown,
  serializer?: (v: any) => string
}): PropertyDecorator {


  return (target, key) => {
    const type = Reflect.getMetadata('design:type', target, key);

    console.log(type.name);
    const keyString = String(key);
    const storageName = `${target.constructor.name}_###_${keyString}`;

    const metadata = Reflect.getMetadataKeys(target);
    console.log({metadata});


    if (type.name === 'HMap') {
      // this is an experiment for now

    } else {

      Object.defineProperty(target, keyString, {
        get() {

          return readFromStorage(storage, storageName, options?.parser);
        },
        set(v: unknown) {
          // this[storagePropertyName] = v;
          writeToStorage(storage, storageName, v, options?.serializer);
        }
      });

    }


  };
}

export interface Serializable<T> {
  parse(v: string): T;
  serialize(v: T): string;
}

export class HMap<I,O> extends Map<I, O> implements Serializable<HMap<I,O>> {


  parse(_v: string): HMap<I, O> {
    console.log({_v});
    throw new Error('Method not implemented.');
  }
  serialize(_v: HMap<I, O>): string {
    console.log({_v});
    throw new Error('Method not implemented.');
  }

}
