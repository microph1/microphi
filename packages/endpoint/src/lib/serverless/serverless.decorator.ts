import 'reflect-metadata';
import { DI, DIOptions, getDIMetadata, Klass } from '@microphi/di';
import { Optional } from 'utility-types';

export interface ServerlessOptions extends Optional<DIOptions> {
  service: Klass
}

export function Serverless(options: ServerlessOptions): ClassDecorator {

  (options.providers ??= []).push(options.service);

  return (target) => {
    return DI(options as DIOptions)(target);
  };
}

/**
 * Get ServerlessOptions stored on a decorated class
 * @param klass - the class
 * @return ServerlessOptions
 */
export function getServerlessMetadataFromClass(klass): ServerlessOptions {
  return getDIMetadata(klass) as ServerlessOptions;
}
