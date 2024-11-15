import { Component, OnChanges, Changes } from '../component.decorator';
import { Input } from '../input.decorator';


@Component({
  selector: 'fx-for',
})
export class FxFor implements OnChanges<FxFor> {
  @Input() of!: unknown[];
  @Input() let!: string;

  template: string;

  constructor(
    private elementRef: HTMLElement
  ) {
    console.assert(this.elementRef);
    this.template = this.elementRef.innerHTML;

  }

  fxOnChanges(changes: Changes<FxFor>) {

    if (changes.let) {
      return ;
    }

    if (this.elementRef.shadowRoot) {
      // clear old data
      this.elementRef.shadowRoot.innerHTML = '';
    }


    this.of.forEach((_, index) => {
      const tpl = document.createElement('template');

      tpl.innerHTML = `
        <fx-item [[${this.let}]]="of[${index}]">
            ${this.template}
        </fx-item>
        `;

      this.elementRef.appendChild(tpl.content.cloneNode(true));
    });


  }

}
