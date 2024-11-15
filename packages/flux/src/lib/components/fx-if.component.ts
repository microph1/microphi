import { Component } from '../component.decorator';
import { Input } from '../input.decorator';

@Component({
  selector: 'fx-if',
  template: '<!-- empty: will add content when needed -->',
})
export class FxIf {
  @Input() condition!: boolean;

  private slot!: HTMLSlotElement;
  private nodeElm!: Node;

  constructor(private elm: HTMLElement) {
    this.slot = document.createElement('slot');
  }


  fxOnChanges() {

    if (this.condition) {
      this.nodeElm = this.elm.appendChild(this.slot);
    } else {
      this.elm.shadowRoot!.removeChild(this.nodeElm);
    }

  }
}
