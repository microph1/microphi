
import { Class } from 'utility-types';

const builtInMethods = Object.keys(Object.getOwnPropertyDescriptors(Object.getPrototypeOf({})));

export function scanInstance<T extends object>(instance: T, cb: (proto: Class<T>, key: string) => void) {

  let proto = Object.getPrototypeOf(instance);

  while (proto) {

    const descriptors = Object.getOwnPropertyDescriptors(proto);

    Object.keys(descriptors)
      .filter((k) => {
        return !builtInMethods.includes(k);
      })
      .forEach((key) => cb(proto, key));

    try {
      proto = Object.getPrototypeOf(proto);
    } catch (e) {
      proto = null;
    }
  }

}
