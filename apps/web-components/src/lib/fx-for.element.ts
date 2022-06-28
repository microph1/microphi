import { Injectable } from '@microgamma/digator';
import { Component } from './component';
import { FxElement } from './fx.element';
import { Input } from './input';


@Injectable()
// @Component({
//   selector: 'fx-for',
//   template: `
//     <div>for {{for}} of {{of}}</div>
//   `,
//   templateUrl: './test.component.html',
// })
export class FxForElement extends FxElement {

  @Input() of: string[];
  @Input() for: string;
  //
  // interval;

  constructor() {
    super();
    this.logger('*************************************************************************************88');
    // this.metadata.inputs.push('item');
    // // @ts-ignore
    // this.item = 1;

  }

  override attributeChangedCallback(name, oldValue, newValue) {
    this.logger('attribute changed', name)
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  fxOnInit(): void {
    // this;
    debugger;
  }


  protected override render() {
    // debugger;
    // const items = [];
    //
    // const content = html`
    //     <ul>
    //       ${items.map((i) => `<li>${i}</li>`).join('')}
    //     </ul>
    // `;
    //
    // this.shadowRoot.innerHTML = content;
    //

  }

  fxOnDestroy(): void {
    // this.log('component destroyed', this.uid);
  }
}
