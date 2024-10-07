import 'reflect-metadata';
import { EventEmitter } from 'stream';

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

    // @ts-ignore
    console.log({target, key});

    if (type.name === 'HMap') {

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


  parse(v: string): HMap<I, O> {
    throw new Error('Method not implemented.');
  }
  serialize(v: HMap<I, O>): string {
    throw new Error('Method not implemented.');
  }

}
