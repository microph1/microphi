import { Component } from '@flux/core';
import template from './fx-header.component.html';

@Component({
  selector: 'fx-header',
  shadowRoot: false,
  template,
})
export class FxHeaderComponent {
  title: string = 'Metronoman';
}
