/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subject } from 'rxjs';
import { getComponentMetadataFromInstance } from './component.decorator';


export const HydratedSymbol = Symbol('@Hydrated');

export function Hydrated(scope: string = ''): PropertyDecorator {

  return (target, property) => {
    Reflect.defineMetadata(HydratedSymbol, scope, target, property);
  };

}

export interface FxComponent {
  propertyChange: Subject<any>;
  nativeElement: HTMLElement;
}

export function addWatchers(instance: FxComponent): void {

  const metadata = getComponentMetadataFromInstance(instance);
  const properties = Object.getOwnPropertyNames(instance);

  const allProperties = new Set([...(metadata.inputs || []), ...properties]);

  for (const property of allProperties) {

    if (
      ['propertyChange'].includes(property) ||
      typeof instance[property] === 'function'
    ) {
      continue;
    }

    if (instance[property] instanceof Subject) {
      Object.defineProperty(instance, `${property}$$`, {
        writable: true
      });

      (instance[property] as Subject<any>).subscribe((value) => {
        instance[`${property}$$`] = value;

        instance.propertyChange.next(({
          event: 'attributeChanged',
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

      const value = localStorage.getItem(hydrateScope) ? JSON.parse(localStorage.getItem(hydrateScope)!) : null;

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
            event: 'attributeChanged',
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
