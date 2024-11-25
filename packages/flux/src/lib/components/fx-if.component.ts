import { Component } from '../component.decorator';
import { Input } from '../input.decorator';

@Component({
  selector: 'fx-if',
  template: '<!-- empty: will add content when needed -->',
})
export class FxIf {
  @Input() condition!: string|boolean;

  private slot!: HTMLSlotElement;
  private nodeElm!: Node;

  constructor(private elm: HTMLElement) {
    this.slot = document.createElement('slot');
  }


  fxOnChanges() {
    // TODO handle type coercion internally
    const condition = typeof this.condition === 'boolean' ? this.condition : this.condition === 'true';


    if (condition) {
      this.nodeElm = this.elm.appendChild(this.slot);
    } else {
      try {

        this.elm.shadowRoot!.removeChild(this.nodeElm);
      } catch (error) {
        console.log('Unable to remove child', this.nodeElm);

      }
    }

  }
}
