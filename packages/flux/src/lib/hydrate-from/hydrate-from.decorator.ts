export interface HydrateFromOptions<T = any> {
  /**
   * turns the stored string back into the property value, default `JSON.parse`
   */
  parser?: (v: string) => T;
  /**
   * turns the property value into the string to store, default `JSON.stringify`
   */
  serializer?: (v: T) => string;
}

export function readFromStorage<T = unknown>(storage: Storage, namespace: string, parser?: (v: string) => T): T {
  const value = storage.getItem(namespace) || 'false';

  if (parser) {
    return parser(value);
  }
  return JSON.parse(value) || undefined;
}

export function writeToStorage<T = unknown>(storage: Storage, key: string, value: T, serializer?: (v: T) => string) {
  storage.setItem(key, serializer ? serializer(value) : JSON.stringify(value));
}

export function HydrateFrom(storage: Storage, options?: HydrateFromOptions) {

  return (target, key) => {

    const keyString = String(key);
    const storageName = `${target.constructor.name}_###_${keyString}`;

    Object.defineProperty(target, keyString, {
      get(): any {

        return readFromStorage(storage, storageName, options?.parser);
      },
      set(v: any): void {
        writeToStorage(storage, storageName, v, options?.serializer);
      }
    });

  };
}
