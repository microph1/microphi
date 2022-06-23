import { Injectable } from '@microgamma/digator';
import { Component } from './component';
import { FxElement, html, OnDestroy, OnInit } from './fx.element';
import { Input } from './input';
import { Log, Logger } from '@microgamma/loggator';
import { faker } from '@faker-js/faker';


@Injectable()
@Component({
  selector: 'fx-for',
  template: `<slot></slot>`,
  templateUrl: './test.component.html',
})
export class FxForElement extends FxElement implements OnInit, OnDestroy {

  @Log()
  log: Logger;

  @Input() items: string;

  interval;

  constructor() {
    super();
    this.log('constructing FxForElement');
    this.metadata.inputs.push('item');
    // @ts-ignore
    this.item = 1;

  }

  fxOnInit(): void {
    this;
    debugger;
  }


  protected override render() {
    debugger;
    const items = [faker.name.firstName(), faker.name.firstName(), faker.name.firstName()];

    const content = html`
        <ul>
          ${items.map((i) => `<li>${i}</li>`).join('')}
        </ul>
    `;

    this.shadowRoot.innerHTML = content;


  }

  fxOnDestroy(): void {
    // this.log('component destroyed', this.uid);
  }
}
