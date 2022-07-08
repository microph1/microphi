import { Subject } from 'rxjs';
import { getComponentMetadata } from './component.decorator';
import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('@flux:add-watcher');

export interface FxComponent {
  propertyChange: Subject<any>;
  nativeElement: HTMLElement;
}

export function addWatchers(instance: FxComponent): void {

  const metadata = getComponentMetadata(instance);
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

      const shadowProp = `__${property}__`;

      Object.defineProperty(instance, shadowProp, {
        enumerable: false,
        writable: true,
        value: instance[property]
      });

      Object.defineProperty(instance, property, {
        enumerable: true,
        get: function() {
          return this[shadowProp];
        },
        set: function(value) {
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
