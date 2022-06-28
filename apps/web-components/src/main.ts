// import { bootstrap, DI, Inject } from '@microgamma/digator';
// import { FxTestComponent } from './components/test/test.component';
// import { RootComponent } from './components/root.component';
// import { getDebugger, setNamespace } from '@microgamma/loggator';
// import { webComponents } from './lib/component';
// import { FxForElement } from './lib/fx-for.element';
//
// setNamespace('web-components');
//
// const d = getDebugger('web-components:main')
//
// @DI({
//   providers: [
//     RootComponent,
//     FxTestComponent,
//     FxForElement,
//   ]
// })
// class App {
//
//
//   static {
//
//     d('registered components', webComponents);
//
//   }
//
//   constructor(
//     // @Inject(RootComponent) root: RootComponent,
//   ) {
//     console.log('constructing app');
//
//     // document.body.appendChild(root);
//
//
//   }
// }
//
// const app = bootstrap(App);
//
// console.log({app});


// uncommet above to go to version 1


import { Component, registerDirective } from './lib/component2';
import { Input } from './lib/input';
import { html } from './lib/fx2.element';
import { generateUUID } from './lib/utilities';


export function fxIf(node, value) {

  console.log('running directive on', node, 'with value', value);
  if (value) {
    node.style.setProperty('display', 'block');
  } else {
    node.style.setProperty('display', 'none');
  }

}

registerDirective('fxif', fxIf);

registerDirective('fxfor', (node, value: string[]) => {

  console.log('this is fxfor', node, value);
  debugger;
});

// @Component({
//   selector: 'fx-test',
// })
// class FxTestRender {
//   @Input() firstname: string;
//   @Input() lastname: string;
//
//   click() {
//     console.log('clicked');
//   }
//
//   render() {
//     return html`
//       <h2>this renders ${this.firstname} - ${this.lastname} </h2>
//       <button (click)="click($event)">😈</button>
//     `
//   }
// }
//
@Component({
  selector: 'fx-user',
  template: `
    <h1>Hello Mr. {{firstname}} - {{lastname}}</h1>

    <div>
        {{firstname}}
    </div>
    <div class="container">
        <slot></slot>
    </div>
  `
})
class FxUser {
  @Input() firstname: string;
  @Input() lastname: string;
}

// @Component({
//   selector: 'fx-root',
//   template: `
//     <fx-user firstname="{{name}}" lastname="{{surname}}">
//       <small>this text is transcluded from fx-user and variable are resolved from its parent <b>>__{{surname}}__</b></small>
//     </fx-user>
//     <button (click)="changeName(event);">click</button>
//     <button (click)="toggleDescription()">Toggle</button>
//     <div #fxIf="isVisible">
//         <h2>The Dom ({{isVisible}})</h2>
//         <h3>How to traverse the dom</h3>
//         <p>
//             this is how to get all nodes
//             <ul>
//                 <li>prepare spaceship</li>
//                 <li>prepare helmet</li>
//                 <li #fxFor="let item of items">{{item}}</li>
//             </ul>
//             <div>
//                 nested3
//                 <span>{{items}}</span>
//             </div>
//         </p>
//     </div>
//   `
// })
// class RootComponent {
//   @Input() name: string = 'davide';
//   @Input() surname: string = 'cavaliere';
//   items = ['abc', '123', 'xyz'];
//   isVisible = false;
//
//   toggleDescription() {
//     this.isVisible = !this.isVisible;
//   }
//
//   changeName(event) {
//     console.log('event', event);
//     this.name += 'e';
//     this.items.push(this.name)
//     console.log('new name', this.name, this.items);
//   }
// }

@Component({
  selector: 'fx-simple',
  // template: (comp: FxSimpleComponent) => `
  //   <h1>Hello Mr. ${comp.name}</h1>
  // `,
  template: `

   <style>
        :host {
            padding: 12px;
        }
   </style>
   <fx-user firstname="{{name}}" lastname="{{lastname}}">
     <small>tr: {{name}}</small>
     <button (click)="change()">{{name}}</button>
   </fx-user>

   <button (click)="change()">{{name}}</button>
   <button (click)="add()">add</button>
   <button (click)="toggleDescription()">Toggle</button>
   <div #fxIf="isVisible">
       <h2>The Dom ({{isVisible}})</h2>
       <h3>How to traverse the dom</h3>
       <p>
           this is how to get all nodes
           <ul>
               <li>prepare spaceship</li>
               <li>prepare helmet</li>
               <li #fxFor="let item of items">{{item}}</li>
           </ul>
           <div>
               nested3
               <span>{{items}}</span>
           </div>
       </p>
       <button (click)="add()">add</button>

   </div>
  `
})
class FxSimpleComponent {
  @Input() name: string = 'Davide';
  @Input() isVisible: boolean = false;

  lastname = 'Cavaliere';
  items = [generateUUID()];

  change(ev) {
    this.name = generateUUID();
    console.log('new name', this.name);
  }

  add() {
    this.items = [...this.items, generateUUID()];
  }

  toggleDescription() {
    this.isVisible = !this.isVisible;
  }
}
