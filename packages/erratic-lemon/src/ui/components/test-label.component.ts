import { Component, Input } from '@microphi/flux';


@Component({
  selector: 'test-component-sh',
  template: `
    <style>
      :host {
        padding: 6px;
        border: 1px solid black;
        border-radius: 16px;
      }
    </style>

    <span>{{firstname}}:{{lastname}}</span> ->
    <slot></slot>
  `
})
export class TestLabelComponent {
  @Input() firstname!: string;
  @Input() lastname!: string;
}
