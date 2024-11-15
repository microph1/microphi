import { Component } from '@microphi/flux';

@Component({
  selector: 'fx-label',
  template: `
    <style>
      .label {
        color: cyan;
        font-size: 20px;
      }
    </style>
    <span class="label">
      <slot></slot>
    </span>
  `,
})
export class FxLabelComponent {}
