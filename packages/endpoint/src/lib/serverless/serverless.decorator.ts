import 'reflect-metadata';
import { DI, DIOptions, getDIMetadata, Klass } from '@microphi/di';

export interface ServerlessOptions extends Partial<DIOptions> {
  /** the endpoint, or the endpoints, this app serves; `bootstrap` returns the (first) one */
  service: Klass | Klass[];
}

export function Serverless(options: ServerlessOptions): ClassDecorator {

  (options.providers ??= []).push(...serviceList(options.service));

  return (target) => {
    return DI(options as DIOptions)(target);
  };
}

/**
 * Get ServerlessOptions stored on a decorated class
 * @param klass - the class
 * @return ServerlessOptions
 */
export function getServerlessMetadataFromClass(klass: Klass): ServerlessOptions {
  return getDIMetadata(klass) as ServerlessOptions;
}

/** the `service` option as a list */
export function serviceList(service: Klass | Klass[]): Klass[] {
  return ([] as Klass[]).concat(service);
}
