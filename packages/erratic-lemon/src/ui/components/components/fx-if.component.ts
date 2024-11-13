import { Component } from '@microphi/flux';
import { Input } from '@microphi/flux';

@Component({
  selector: 'fx-if',
  template: `
    <slot style="display: {{condition}}"></slot>
  `
})
export class FxIf {
  @Input() condition!: boolean;
}
