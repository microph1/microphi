import { Component } from '@microphi/flux';
import template from './fx-root.component.html?raw';

@Component({
  selector: 'fx-root',
  // templateUrl: import.meta.resolve('./fx-root.component.html')
  template,
})
export class FxRootComponent {
  name = 'Davide';

  color = 'red';

  // numbers = [{ a: 1, b: '1' }, { a: 2, b: '2' }, { a: 3, b: '3' }, { a: 4, b: '5' }, { a: 5, b: '5' }];

  numbers = new Array(2).fill(1).map((_value, index) => {
    return { a: index, b: `_$_${index}_$_` };
  });

  showContent = 'none';

  constructor(
    private elementRef: HTMLElement,
  ) {
    console.debug('FxRootComponent started');
  }

  addItem() {

    this.name = this.name + this.name.slice(-1);
    this.color = this.color === 'red' ? 'black' : 'red';
    console.log('name', this.name);
    this.numbers = [{ a: this.numbers.length, b: String(this.numbers.length) }, ...this.numbers];
    this.showContent = this.showContent === 'none' ? 'block' : 'none';

    const tpl = document.createElement('template');

    tpl.innerHTML = `
<test-component-sh firstname="{{name}}" lastname="{{name}}">
  <span>transcluded name {{name}}</span>
</test-component-sh>
    `;


    this.elementRef.appendChild(tpl.content.cloneNode(true));
  }

  onInputChange(ev: KeyboardEvent) {
    const value = (ev.currentTarget as HTMLInputElement).value;
    console.log({ value });

    this.name = value;
  }

}
