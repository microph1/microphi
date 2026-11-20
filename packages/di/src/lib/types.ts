
// declared here rather than imported from utility-types: published typings must not
// reference a package consumers don't install
export type Klass<T = any> = new (...args: any[]) => T;

/**
 * What a dependency is provided and injected as: any class, abstract ones
 * included, so an abstract base can stand for the implementation provided
 * with `useClass`.
 */
export type Token<T = any> = abstract new (...args: any[]) => T;

export type Instance<T extends Klass<any> = any> = InstanceType<T>;

export interface ProviderDefinition {
  provide: Token,
  useClass: Klass
}

export function isSingletonDefinition(c: ProviderDefinition | Klass): c is ProviderDefinition {
  return 'provide' in c && 'useClass' in c;
}

export type Provider = ProviderDefinition | Klass;
