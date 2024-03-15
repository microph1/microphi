/**
 * Runs the `fn` before the annotated method
 *
 * @remarks
 * Decorate a method to execute `fn` before it.
 * `fn` params will be the same type as the decorated function and it __must__ return the same type.
 * To have type checking you need to provide type information into this decorator generics.
 * `fn` can __must__ return this same type or void.
 *
 * @example
 * ```typescript
 * // basic example
 * class TestClass {
 *
 *   @Before<string>((name) => {
 *     return name.toUpperCase();
 *   })
 *   public simpleParamSimpleType(name: string) {
 *     return `hello ${name}`;
 *   }
 * }
 * ```
 * For more example see `before.decorator.spec.ts`
 *
 * @param fn
 */
export function Before<P>(fn: (args: P) => P): MethodDecorator {

  return (target, key, descriptor: PropertyDescriptor) => {

    const originalMethod = descriptor.value;

    // use function() to keep original `this`
    descriptor.value = function() {

      // @ts-ignore
      const retValue = fn.bind(this).apply(this, arguments) as any;

      // so here we can call originalMethod with retValue
      // doing so beforeFn has the ability to change original arguments's values
      if (retValue === undefined) {
        return originalMethod.apply(this, arguments);
      }

      return originalMethod.apply(this, [].concat(retValue));
    };

    return descriptor;
  };
}
