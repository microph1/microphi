import { Component } from '@microphi/flux';
import { Input } from '@microphi/flux';


@Component({
  selector: 'fx-for',
})
export class FxFor {
  @Input() of!: unknown[];
  @Input() let!: string;

  template: string;

  constructor(
    private elementRef: HTMLElement
  ) {
    console.assert(this.elementRef);
    this.template = this.elementRef.innerHTML;

  }

  fxOnChanges(changes: any) {
    console.log({ changes });
    console.assert(changes);


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
