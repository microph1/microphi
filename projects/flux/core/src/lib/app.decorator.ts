import { DI, DIOptions } from '@microgamma/digator';
import { getDebugger } from '@microgamma/loggator';
import { Class } from 'utility-types';
import { getComponentMetadata } from './component.decorator';
import { AsyncSubject } from 'rxjs';

const d = getDebugger('@flux:core:@App');

export const AppSymbol = Symbol('@App');

export interface App extends Partial<DIOptions> {
  declarations?: Class<any>[]; // TODO see if we can narrow this type
}

export const start$ = new AsyncSubject<void>();

export function App(options: App) {


  const promises = [];

  for (const declared of options.declarations) {

    const metadata = getComponentMetadata(declared);
    d('parsing declared', declared, metadata);
    promises.push(
      customElements.whenDefined(metadata.selector)
    );
  }

  Promise.all(promises).then(() => {
    d('all component declared we can start app now!');
    start$.next();
    start$.complete();
  });

  return (target) => {
    return DI({
      providers: [],
      ...options
    })(class extends target {

      constructor() {
        d('this is the augmented app constructor');
        super();
      }
    });
  }
}
