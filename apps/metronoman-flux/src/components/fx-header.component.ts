import { Component } from '@microphi/flux';
import template from './fx-header.component.html';

@Component({
  selector: 'fx-header',
  template,
})
export class FxHeaderComponent {
  title: string = 'Metronoman';
}
