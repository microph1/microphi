import { Class } from 'utility-types';

export type Klass<T = any> = Class<T>;

export type Instance<T extends Class<any> = any> = InstanceType<T>;

export interface ProviderDefinition {
  provide: Klass,
  useClass: Klass
}

export function isSingletonDefinition(c: ProviderDefinition | Klass): c is ProviderDefinition {
  return 'provide' in c && 'useClass' in c;
}

export type Provider = ProviderDefinition | Klass;
