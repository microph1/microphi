# @microphi/flux [![npm](https://img.shields.io/npm/v/@microphi/flux)](https://www.npmjs.com/package/@microphi/flux)

> Web-component framework: `@Component`, template bindings, `fx-for` / `fx-if`

Experimental: every component is a native custom element with its own shadow DOM, wired with decorators and resolved through [`@microphi/di`](../di).

## Install

```sh
npm i @microphi/flux @microphi/di rxjs reflect-metadata
```

Enable legacy decorators in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

## Bootstrap an application

```typescript
import { App, bootstrap } from '@microphi/flux';
import { FxCounterComponent } from './fx-counter.component';

@App({
  declarations: [FxCounterComponent],
  providers: [], // @microphi/di providers
})
class FluxApp {}

bootstrap(FluxApp);
```

## Components

```typescript
import { Component, html } from '@microphi/flux';

@Component({
  selector: 'fx-counter',
  template: html`
    <style>
      .row { display: flex; gap: 6px; }
    </style>

    <div class="row">
      <button (click)="decrease()">-</button>
      <span>{{counter}}</span>
      <button (click)="increase()">+</button>
    </div>
  `,
})
export class FxCounterComponent {
  counter = 0;

  increase() { this.counter++; }
  decrease() { this.counter--; }
}
```

Styles in the template are encapsulated by the shadow DOM, and `<slot>` works as usual for transclusion.

`@Component` options:

| Option | |
|---|---|
| `selector` | custom element tag name |
| `template` / `templateUrl` | inline template, or a URL fetched at runtime |
| `style` / `styleUrls` | component styles, inline or linked |

`registerGlobalStyles(...urls)` adds stylesheets to every component's shadow root. `html` and `css` are no-op template tags, there for editor highlighting.

### Template syntax

| Syntax | |
|---|---|
| `{{expr}}` | text interpolation |
| `{{value \| json}}` | interpolation through a pipe registered with `registerPipe('json', fn)` |
| `(click)="method(arg, $event)"` | event binding |
| `[value]="expr"` | property binding, also how a parent sets a child's `@Input` |
| `#name` | assigns the element to `this.name` on the component |

### Decorators

```typescript
@Component({ selector: 'fx-player', template: html`<canvas #canvas></canvas>` })
export class FxPlayerComponent {
  @Input() src!: string;                          // settable via [src]="..."

  @ViewChild('canvas') canvas!: HTMLCanvasElement; // linked from #canvas

  @HydrateFrom(localStorage) volume = 1;          // persisted in the given Storage

  @HostListener('click')
  toggle() { /* click on the host element */ }
}
```

`@HydrateFrom` stores values as JSON; pass `{ parser, serializer }` for anything JSON can't round-trip:

```typescript
@HydrateFrom(localStorage, {
  serializer: (v: Map<string, number>) => JSON.stringify([...v.entries()]),
  parser: (v: string) => new Map(JSON.parse(v) || []),
})
scores!: Map<string, number>;
```

### Lifecycle

Implement any of `OnInit`, `OnViewInit`, `OnChanges`, `OnDestroy`:

| Hook | Called |
|---|---|
| `fxOnInit()` | once the component is connected |
| `fxOnViewInit()` | after the template is rendered |
| `fxOnChanges(changes)` | when an `@Input` changes, with `{ [input]: { name, oldValue, newValue } }` |
| `fxOnDestroy()` | when the element is removed |

## Built-in components

```html
<fx-if [condition]="isVisible">
  <p>shown only when isVisible is truthy</p>
</fx-if>

<fx-for let="user" [of]="users">
  <li>{{user}}</li>
</fx-for>
```
