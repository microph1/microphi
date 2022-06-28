import { Injectable } from '@microgamma/digator';
import { Component } from '../lib/component';
import { FxElement, html } from '../lib/fx.element';
import { Input } from '../lib/input';
import { generateUUID } from '../lib/utilities';

// @Component({
//   selector: 'fx-root',
//   templateHtml: ({name, uid}) => html`
//     <div>${name}<i>(${uid})</i></div>
//     <button (click)="changeName()">Change name</button>
//   `,
//   template: `
//     <style>
//       .main {
//         display: flex;
//         flex-direction: column;
//         padding: 12px;
//       }
//     </style>
//     <div class="main">
//       <div>
//         {{name}} <i>({{uid}})</i>
//         <button (click)="changeName()">Change name</button>
//       </div>
//       <fx-test name="{{name}}">
//         <code (click)="changeName()">this code should be transcluded</code>
//       </fx-test>
//       <pre>
//         <ul>
//           <fx-for for="name" of="{{names}}">
//             <template>
//               <li>{{name}}</li>
//             </template>
//           </fx-for>
//         </ul>
//
//         <ul>
//           <li of="{{names}}"></li>
//         </ul>
//
//       </pre>
//     </div>
//   `
// })
@Injectable()
export class RootComponent extends FxElement {

  @Input() names = [];

  @Input() name: string = 'davide';

  constructor() {
    super();

    setTimeout(() => {
      this.name = generateUUID();
      // trigger change detection
      this.names = [...this.names, this.name];
    }, 2000)
  }

  changeName() {
    console.log('current name', this.uid);
    this.name = generateUUID();
    this.names = [...this.names, this.name];
    console.log('new name', this.name);
  }
}
