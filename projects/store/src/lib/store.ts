export const StoreMetadata = Symbol('@Store');

export interface StoreOptions {
  initialState: any;
}

export function Store(options: StoreOptions) {

  return (target) => {

    Reflect.defineMetadata(StoreMetadata, options, target);
  };
}

export function getStoreMetadata(instance): StoreOptions {
  return JSON.parse(JSON.stringify(Reflect.getMetadata(StoreMetadata, instance.constructor))) || {};
}
