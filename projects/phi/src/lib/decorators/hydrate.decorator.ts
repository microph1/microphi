export function HydrateFrom(storage: Storage): PropertyDecorator {
  return (target, key) => {

    // if (target[key] !== undefined) {
    //   throw new Error(`Property ${String(key)} should not be initialized`);
    // }

    const keyString = String(key);
    const storageName = `${target.constructor.name}_###_${keyString}`;
    // const storagePropertyName = `__${String(key)}`;

    // Object.defineProperty(target, storagePropertyName, {
    //   enumerable: false,
    //   writable: true
    // });

    Object.defineProperty(target, keyString, {
      get(): any {
        return JSON.parse(storage.getItem(storageName));
      },
      set(v: any): void {
        // this[storagePropertyName] = v;
        storage.setItem(storageName, JSON.stringify(v));
      }
    });

  };
}
