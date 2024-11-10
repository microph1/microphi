import { Component } from '@microphi/flux';

@Component({
  selector: 'fx-item',
  template: `
    <slot></slot>
  `,
})
export class FxItem {}
