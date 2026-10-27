import 'reflect-metadata';

const EndpointMetadata = Symbol.for('Endpoint');

/**
 * readonly name: string;  // name of the endpoint
 * readonly basePath?: string;  // base path that will be prepended to the path defined in each lambda.
 * readonly private?: boolean;  // Default: false. Setting this field is equivalent to add its value to every @Lambda. If any @Lambda as private set then that will have precedence
 * readonly cors?: boolean;  // Default: false. Same as private.
 * readonly providers?: Provider;  // Use the provided implementation instead of the default.
 */
export interface EndpointOptions {
  readonly name: string;
  readonly basePath?: string;
  readonly private?: boolean;
  readonly cors?: boolean;
}

/**
 * Define an Endpoint decorating a class such as
 * ```typescript
 *
 * @Endpoint({
 *   name: 'my-endpoint',
 *   basePath: '/test', // Optional base path, Defaults to /
 *   private: false, // Optional, Defaults to false
 *   cors: true, // Optional, Defaults to false,
 * })
 * export class MyEndpoint {}
 *
 * ```
 *
 * @param options EndpointOptions
 * @constructor
 */
export function Endpoint(options: EndpointOptions): ClassDecorator {
  return (target) => {

    Reflect.metadata(EndpointMetadata, options)(target);
  };
}

/**
 * Get EndpointOptions stored on a decorated class from its instance
 * @param instance - the instance of the decorated class
 * @return EndpointOptions
 */
export function getEndpointMetadata(instance): EndpointOptions {
  return Reflect.getMetadata(EndpointMetadata, instance.constructor);
}

/**
 * Get EndpointOptions stored on a decorated class
 * @param klass - the class
 * @return EndpointOptions
 */
export function getEndpointMetadataFromClass(klass): EndpointOptions {
  return Reflect.getMetadata(EndpointMetadata, klass);
}

