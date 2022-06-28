import { Injectable } from '@microgamma/digator';
import { FxElement, OnDestroy } from '../../lib/fx.element';
import { Component } from '../../lib/component';
import { Input } from '../../lib/input';

@Injectable()
// @Component({
//   selector: 'fx-test',
//   template: `
//     <h1>Hello Mr. <span (click)="clickMe();">{{name}}<i>({{uid}})</i></span></h1>
//        <slot></slot>
//   `,
//   templateUrl: './test.component.html',
// })
export class FxTestComponent extends FxElement implements OnDestroy {

  @Input() name: string;

  // interval;

  constructor() {
    super();

    // console.log('setting interval');
    // this.interval = setInterval(() => {
    //   this.name =  'Davide'
    //   console.log('changed name back on', this.uid);
    // }, 5000);
  }

  clickMe() {
    console.log('you did it!', this.name);
  }

  fxOnDestroy(): void {
    // clearInterval(this.interval)
  }


}
