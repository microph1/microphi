/* eslint-disable @typescript-eslint/no-explicit-any */
import { DI, DIOptions } from '@microphi/di';
import { Class } from 'utility-types';
import { getComponentMetadata } from './component.decorator';
import { AsyncSubject } from 'rxjs';


export const AppSymbol = Symbol('@App');

export interface App extends Partial<DIOptions> {
  declarations?: Class<any>[]; // TODO see if we can narrow this type
}

export const start$ = new AsyncSubject<void>();

export function App(options: App) {

  if (!options.providers) {
    options.providers = [];
  }

  const promises: Promise<unknown>[] = [];

  for (const declared of options.declarations!) {

    const metadata = getComponentMetadata(declared);
    promises.push(
      customElements.whenDefined(metadata.selector)
    );
  }

  Promise.all(promises).then(() => {
    // all component declared we can start app now!
    start$.next();
    start$.complete();
  });

  return (target: any) => {
    return DI({
      providers: [],
      ...options
    })(class extends target {

      constructor() {
        super();
      }
    });
  };
}
