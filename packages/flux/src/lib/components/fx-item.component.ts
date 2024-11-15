import { Component } from '../component.decorator';

@Component({
  selector: 'fx-item',
  template: `
    <slot></slot>
  `,
})
export class FxItem {}
