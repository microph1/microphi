import { Component } from '@flux/core';

@Component({
  selector: 'fx-root',
  template: `
    <fx-header></fx-header>
    <fx-bpm class="fx-flex-grow m-3"></fx-bpm>
  `
})
export class FxRootComponent {
}
