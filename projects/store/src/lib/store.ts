export const StoreMetadata = '@Store';

export interface StoreOptions {
  initialState: any;
}

export function Store(options: StoreOptions) {

  return (target) => {

    Reflect.defineMetadata(StoreMetadata, options, target);
  };
}

export function getStoreMetadata(instance): StoreOptions {
  return Reflect.getMetadata(StoreMetadata, instance.constructor) || {};
}


export class StaticStore {
  static (options: StoreOptions): ClassDecorator {
    return (target) => {
      Reflect.defineMetadata(StoreMetadata, options, target);
    };
  }
} 
