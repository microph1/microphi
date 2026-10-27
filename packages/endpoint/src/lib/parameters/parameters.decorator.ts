import 'reflect-metadata';

export const PathParameterMetadata = Symbol.for('Path');
export const HeaderParameterMetadata = Symbol.for('Header');
export const BodyParameterMetadata = Symbol.for('Body');

export type PathParameterOptions = string;

export function Path(options: PathParameterOptions): ParameterDecorator {
  return (target: any, key: string | symbol | undefined, index: number) => {

    const stored = getPathMetadata(target, key);

    // TODO: check for key already exists
    // TODO: allow optional options and get path part name from function (target[key]) signature
    stored[options] = index;

    Reflect.defineMetadata(PathParameterMetadata, stored, target, key as string | symbol);
  };
}

export function getPathMetadata(instance, key) {
  const metadata = Reflect.getMetadata(PathParameterMetadata, instance, key);
  return metadata || {};
}

export function Header(options: string): ParameterDecorator {
  return (target: any, key: string | symbol | undefined, index: number) => {
    const stored = getHeaderMetadata(target, key);

    // TODO: check for key already exists
    stored[options] = index;

    Reflect.defineMetadata(HeaderParameterMetadata, stored, target, key as string | symbol);
  };
}

export function getHeaderMetadata(instance, key) {
  const metadata = Reflect.getMetadata(HeaderParameterMetadata, instance, key);
  return metadata || {};
}

export function Body(): ParameterDecorator {
  return (target: any, key: string | symbol | undefined, index: number) => {

    const stored = getBodyMetadata(target, key);

    // TODO: check for key already exists
    stored['body'] = index;

    Reflect.defineMetadata(BodyParameterMetadata, stored, target, key as string | symbol);
  };
}

export function getBodyMetadata(instance, key) {
  const metadata = Reflect.getMetadata(BodyParameterMetadata, instance, key);
  return metadata || {};
}
