
// declared here rather than imported from utility-types: published typings must not
// reference a package consumers don't install
export type Klass<T = any> = new (...args: any[]) => T;

export type Instance<T extends Klass<any> = any> = InstanceType<T>;

export interface ProviderDefinition {
  provide: Klass,
  useClass: Klass
}

export function isSingletonDefinition(c: ProviderDefinition | Klass): c is ProviderDefinition {
  return 'provide' in c && 'useClass' in c;
}

export type Provider = ProviderDefinition | Klass;
