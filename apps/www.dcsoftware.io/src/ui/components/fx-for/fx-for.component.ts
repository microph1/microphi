import { Changes, Component, Input, OnChanges } from '@microphi/flux';

@Component({
  selector: 'fx-for-two',
})
export class FxFor implements OnChanges<FxFor> {
  @Input() of!: unknown[];
  @Input() let!: string;
  @Input() track!: string;

  private ids = new Set<string>();

  template: string;



  constructor(
    private elementRef: HTMLElement
  ) {
    console.assert(this.elementRef);
    this.template = this.elementRef.innerHTML;

    // copy parent element classes and styles

    if (this.elementRef.classList.value) {

      //this.elementRef.classList.add(...this.elementRef.parentElement!.classList.value.split(' '));
    }
  }

  fxOnChanges(changes: Changes<FxFor>) {

    if (changes.let) {
      return ;
    }





    const elements = this.elementRef.shadowRoot!.querySelectorAll('fx-item');
    // get all elements



    for (const elm of elements) {
      const elmId = elm.id;

      if (!this.ids.has(elmId)) {
        this.elementRef.shadowRoot!.removeChild(elm);
      }

    }


    this.of.forEach((item, index) => {


      const tpl = document.createElement('template');
      let id: string;

      if (item !== null && this.track && typeof item === 'object' && this.track in item) {

        id = sanitizeStringForHTMLID((item as {[k: string]: string})[this.track]);
      } else {
        id = sanitizeStringForHTMLID(item as string);
      }

      tpl.innerHTML = this.template;

      const elm = this.elementRef.shadowRoot!.getElementById(id);

      const clone = tpl.content.cloneNode(true);

      [...(clone as HTMLElement).children].forEach((elm) => {


        (elm as HTMLElement).dataset[this.let] = JSON.stringify(this.of[index]);
      });


      if (elm) {
        this.elementRef.shadowRoot!.replaceChild(elm, clone);
      } else {
        this.ids.add(id);
        this.elementRef.appendChild(clone);
      }

    });


  }

}

function sanitizeStringForHTMLID(input: string) {
  // Replace invalid characters with a hyphen
  let sanitized = input.replace(/[^a-zA-Z0-9-_\.]/g, '-');

  // Ensure the ID starts with a letter
  if (!/^[a-zA-Z]/.test(sanitized)) {
    sanitized = 'id-' + sanitized;
  }

  return sanitized;
}
