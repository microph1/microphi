export const DocsMetadata = Symbol.for('Docs');
import 'reflect-metadata';

export function Docs(doc: string) {

  return (target) => {
    Reflect.defineMetadata(DocsMetadata, doc, target);
  };

}

export function getDocsMetadata(target): string {
  return Reflect.getMetadata(DocsMetadata, target);
}
