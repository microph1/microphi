# @microphi/flux

> Yet another frontend framework

Microphi is an experimental front-end framework designed to push the boundaries of modern web development. While it showcases some innovative ideas, Microphi is still in its early stages and has a long way to go before it reaches full maturity. We welcome contributions, feedback, and support from developers and enthusiasts who are interested in helping us shape and refine this framework. Together, we can drive Microphi towards a stable, efficient, and user-friendly platform. Join us on this journey and make an impact!

## Install
With your favourite package manager
```
@microphi/flux
```
and install the peers packages
```
@microphi/debug @microphi/di rxjs
```
## Boostrap an application
```typescript
import { bootstrap } from '@microphi/flux';
import { App } from '@microphi/flux';
import { FxRootComponent } from './fx-root.component';


@App({
  declarations: [
    FxRootComponent,
  ]
})
export class FluxApp {

  constructor() {
    console.log('app started');
  }
}

const app = bootstrap(FluxApp);

console.log('App created', app);
```
Let's create a counter component
```typescript
import { Component } from '@microphi/flux';

@Component({
  selector: 'fx-counter',
  template: `
    <style>
      .flex-row {
        display: flex;
        flex-direction: row;
        gap: 6px;
      }

    </style>

    <div class="flex-row">
      <button (click)="increase()">+</button>
      <div>
        {{counter}}
      </div>
      <button (click)="decrease()">-</button>
    </div>
  `
})
export class FxCounterComponent {
  counter = 0;

  increase() {
    this.counter++;
  }

  decrease() {
    this.counter--;
  }
}
```
With the code above we are creating a web component and as such it can contain its `<style>` tag.

Web components ensure style encapsulation and allow transclusion seamlessly leveraging the `<slot>` element.

```typescript

```
