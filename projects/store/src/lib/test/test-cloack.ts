import { Class } from 'utility-types';
//
// type MyType<I extends object> = {
//   [K in keyof I]-?: I[K];
// };
//
// type MyClass<T extends object> = Class<T> & MyType<T>;

export function Disclose<T extends Class<{}>>(Base: T) {

  // console.log('---------------------------------');
  // console.log('show all methods of Base', Base);
  const methods = Object.getOwnPropertyNames(Base.prototype);
  // console.log('methods', methods);
  const descriptors = Object.getOwnPropertyDescriptors(Base);
  // console.log('descriptors', descriptors);
  // console.log('---------------------------------');


  return class extends Base {

    testEffect<E extends string|number>(name: E) {

      // console.log('testing effect', name);

      // const effectsMetadata = getEffectsMetadata(this);
      // console.log({effectsMetadata});
      //
      // const methodName = effectsMetadata[name];
      // console.log({methodName});

      // @ts-ignore
      return super[methodName];
    }
  };

}
