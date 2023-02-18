import { Subject } from 'rxjs';
import { getComponentMetadataFromInstance, HydratedSymbol } from './component.decorator';
import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('@flux:add-watcher');

export interface FxComponent {
  propertyChange: Subject<any>;
  nativeElement: HTMLElement;
}

export function addWatchers(instance: FxComponent): void {

  const metadata = getComponentMetadataFromInstance(instance);
  const properties = Object.getOwnPropertyNames(instance);

  const allProperties = new Set([...metadata.inputs, ...properties]);

  for (const property of allProperties) {

    if (
      ['propertyChange'].includes(property) ||
      typeof instance[property] === 'function'
    ) {
      continue;
    }

    // @ts-ignore
    if (instance[property] instanceof Subject) {
      d('this is a Subject', property);

      Object.defineProperty(instance, `${property}$$`, {
        writable: true
      });

      (instance[property] as Subject<any>).subscribe((value) => {
        d('watched property changed', value);
        instance[`${property}$$`] = value;

        instance.propertyChange.next(({
          event: 'attributedChanged',
          payload: {
            name: property,
            newValue: value
          }
        }));
      });


    } else {
      // check if property is @Hydrated
      const hydrated = Reflect.getMetadata(HydratedSymbol, instance, property);

      const shadowProp = `__${property}__`;

      const hydrateScope = [hydrated, property].join(':');
      const value = JSON.parse(localStorage.getItem(hydrateScope));

      // TODO fix value falsy thing
      // eslint-disable-next-line no-extra-boolean-cast
      const initialValue = !!hydrated && value ? value : instance[property];

      Object.defineProperty(instance, shadowProp, {
        enumerable: false,
        writable: true,
        value: initialValue,
      });

      Object.defineProperty(instance, property, {
        enumerable: true,
        get: function() {
          return this[shadowProp];
        },
        set: function(value) {

          // eslint-disable-next-line no-extra-boolean-cast
          if (!!hydrated) {
            localStorage.setItem(hydrateScope, JSON.stringify(value));
          }

          this[shadowProp] = value;
          this.propertyChange.next(({
            event: 'attributedChanged',
            payload: {
              name: property,
              newValue: value
            }
          }));
        }
      });

    }

  }

}
