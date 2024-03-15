/**
 * Runs the `fn` after the annotated method
 *
 * @remarks
 * Decorate a method to execute `fn` after it.
 * `fn` params will be the same type as the decorated return type and it __must__ return this same type.
 * To have type checking you need to provide type information into this decorator generics.
 * `fn` can __must__ return that same type or void.
 *
 * @example
 * ```typescript
 * class TestClass {
 *
 *   @After<string>((salutation) => {
 *     return salutation.toUpperCase();
 *   })
 *   public testA(name: string): string {
 *     return `Hello ${name}!`;
 *   }
 *
 *   @After<string>((salutation) => {
 *     return salutation.toLowerCase();
 *   })
 *   public testB(name: string, nickname: string): string {
 *     return `Hello ${name} aka ${nickname}!`;
 *   }
 *
 * }
 *
 * ```
 *
 * @param fn
 */
export function After<I, O = I>(fn: (args: I) => O): MethodDecorator {


  return (target, key, descriptor: PropertyDescriptor) => {


    const originalMethod = descriptor.value;

    descriptor.value = function() {


      // eslint-disable-next-line prefer-rest-params
      const retValue = originalMethod.apply(this, arguments);

      return fn.apply(this, [retValue]);


    };

    return descriptor;
  };
}
