import { Changes, Component, Input, OnChanges } from '@microphi/flux';

@Component({
  selector: 'fx-for-two',
})
export class FxFor implements OnChanges<FxFor> {
  @Input() of!: unknown[];
  @Input() let!: string;
  @Input() track!: string;

  template: string;



  constructor(
    private elementRef: HTMLElement
  ) {
    console.assert(this.elementRef);
    this.template = this.elementRef.innerHTML;

    // copy parent element classes and styles

    this.elementRef.classList.add(this.elementRef.parentElement!.classList.value);
  }

  fxOnChanges(changes: Changes<FxFor>) {

    if (changes.let) {
      return ;
    }

    // find elements that have been removed
    // @ts-ignore
    const ids = this.of.map((item) => item[this.track]);

    const elements = this.elementRef.shadowRoot!.querySelectorAll('fx-item');
    // get all elements


    for (const elm of elements) {
      // @ts-ignore
      const elmId = elm[this.track];

      if (!ids.includes(elmId)) {
        this.elementRef.shadowRoot!.removeChild(elm);
      }

    }


    this.of.forEach((item, index) => {


      const tpl = document.createElement('template');

      // @ts-ignore
      const id = item[this.track];

      tpl.innerHTML = `
        <fx-item id="${id}" [[${this.let}]]="of[${index}]">
            ${this.template}
        </fx-item>
        `;

      const elm = this.elementRef.shadowRoot!.getElementById(id);


      if (elm) {
        this.elementRef.shadowRoot!.replaceChild(elm, tpl.content.cloneNode(true));
      } else {
        this.elementRef.appendChild(tpl.content.cloneNode(true));
      }
    });


  }

}
