import { Component, Input } from '@microphi/flux';
import template from './mdc-header.component.html';

@Component({
  selector: 'mdc-header',
  shadowRoot: false,
  template,
})
export class MdcHeaderComponent {
  @Input() title: string;
}
