import 'reflect-metadata';
import { ParameterSchema, setParameterSchema } from './parameter-schema';

export const PathParameterMetadata = Symbol.for('Path');
export const HeaderParameterMetadata = Symbol.for('Header');
export const BodyParameterMetadata = Symbol.for('Body');

export type PathParameterOptions = string;

/** parameter name → parameter index */
export type ParameterMetadata = Record<string, number>;

/**
 * Inject a path parameter.
 * @param name - the `{name}` (or `:name` on Express) in the `@Lambda` path
 * @param schema - optional Standard Schema; the value is validated (400 on failure) and replaced by the schema output
 */
export function Path(name: PathParameterOptions, schema?: ParameterSchema): ParameterDecorator {
  return (target: object, key: string | symbol | undefined, index: number) => {

    const stored = getPathMetadata(target, key);

    // TODO: check for key already exists
    // TODO: allow optional options and get path part name from function (target[key]) signature
    stored[name] = index;

    Reflect.defineMetadata(PathParameterMetadata, stored, target, key as string | symbol);

    if (schema) {
      setParameterSchema(target, key, index, { name, schema });
    }
  };
}

export function getPathMetadata(instance: object, key: string | symbol | undefined): ParameterMetadata {
  const metadata = Reflect.getMetadata(PathParameterMetadata, instance, key as string | symbol);
  return metadata || {};
}

/**
 * Inject a request header.
 * @param name - the header name
 * @param schema - optional Standard Schema, as in `@Path`
 */
export function Header(name: string, schema?: ParameterSchema): ParameterDecorator {
  return (target: object, key: string | symbol | undefined, index: number) => {
    const stored = getHeaderMetadata(target, key);

    // TODO: check for key already exists
    stored[name] = index;

    Reflect.defineMetadata(HeaderParameterMetadata, stored, target, key as string | symbol);

    if (schema) {
      setParameterSchema(target, key, index, { name, schema });
    }
  };
}

export function getHeaderMetadata(instance: object, key: string | symbol | undefined): ParameterMetadata {
  const metadata = Reflect.getMetadata(HeaderParameterMetadata, instance, key as string | symbol);
  return metadata || {};
}

/**
 * Inject the request body.
 * @param schema - optional Standard Schema, as in `@Path`
 */
export function Body(schema?: ParameterSchema): ParameterDecorator {
  return (target: object, key: string | symbol | undefined, index: number) => {

    const stored = getBodyMetadata(target, key);

    // TODO: check for key already exists
    stored['body'] = index;

    Reflect.defineMetadata(BodyParameterMetadata, stored, target, key as string | symbol);

    if (schema) {
      setParameterSchema(target, key, index, { name: 'body', schema });
    }
  };
}

export function getBodyMetadata(instance: object, key: string | symbol | undefined): ParameterMetadata {
  const metadata = Reflect.getMetadata(BodyParameterMetadata, instance, key as string | symbol);
  return metadata || {};
}
