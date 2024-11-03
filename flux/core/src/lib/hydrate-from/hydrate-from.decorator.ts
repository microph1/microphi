export function readFromStorage<T = unknown>(storage: Storage, namespace: string, parser?: (v: any) => any): T {
  const value = storage.getItem(namespace) || 'false';

  if (parser) {
    return parser(value);
  }
  return JSON.parse(value) || undefined;
}

export function writeToStorage<T = unknown>(storage: Storage, key: string, value: T) {
  storage.setItem(key, JSON.stringify(value));
}

export function HydrateFrom(storage: Storage) {

  return (target, key) => {

    const keyString = String(key);
    const storageName = `${target.constructor.name}_###_${keyString}`;

    Object.defineProperty(target, keyString, {
      get(): any {

        return readFromStorage(storage, storageName);
      },
      set(v: any): void {
        // this[storagePropertyName] = v;
        writeToStorage(storage, storageName, v);
      }
    });

  };
}
