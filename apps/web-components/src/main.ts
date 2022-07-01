/* eslint-disable @typescript-eslint/restrict-template-expressions,@typescript-eslint/ban-ts-comment */
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


import { Component, registerDirective, registerPipe, render } from './lib/component2';
import { Input } from './lib/input';
import { BehaviorSubject, delay, Observable } from 'rxjs';
import { faker } from '@faker-js/faker';


registerPipe('async', (source$) => {

  return `__#${source$}#__`;

});

registerPipe('async2', (source$: Observable<any>, node: HTMLElement) => {

  let retValue = `__#will change when it comes#__`;

  source$.pipe().subscribe((value) => {
    console.log('got value in pipe async2', value);
    retValue = value;
  }).unsubscribe();

  return retValue;

});

export function fxIf(node, value) {

  const v = eval(value);

  console.log('running directive on', node, 'with value', {v});
  if (v) {
    node.style.setProperty('visibility', 'visible');
  } else {
    node.style.setProperty('visibility', 'hidden');
  }

}

registerDirective('fxif', fxIf);

registerDirective('fxfor', (node, value: string) => {

  console.log('this is fxfor', node, value);

  const parsedInput = value.match(/^let\s(.+)\sof\s(.+)$/);

  const varname = parsedInput[1];
  const items = parsedInput[2].split(',');

  if (node.hasAttribute('fxfor')) {
    (node as HTMLElement).style.setProperty('display', 'none');
  }

  for (const item of items.reverse()) {

    const clone = node.parentNode.querySelector(`[data-fxfor="${item}"]`) || document.createElement(node.tagName);


    // @ts-ignore
    const template = node.childNodes[0].data;
    const interpolated = render(template, {
      [varname]: item
    });

    clone.innerHTML = interpolated;
    clone.setAttribute( 'data-fxfor', item);

    node.after(clone);
  }

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
    <small>{{firstname | async}}</small>

    <div>
        {{fullname | async2}}
    </div>
    <button (click)="next()">next</button>
    <div class="container">
        <slot></slot>
    </div>
  `
})
class FxUser {
  @Input() firstname: string;
  @Input() lastname: string;

  _fullname = new BehaviorSubject('Davide Cavaliere');
  fullname = this._fullname.pipe(
    delay(500),
  );

  next() {
    const name = `${faker.name.firstName()} ${faker.name.lastName()}`;
    this._fullname.next(name);
    console.log('new name nexted', name);
  }
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
   <div id="if" fxIf="{{isVisible}}">
       <h2>The Dom ({{isVisible}})</h2>
       <h3>How to traverse the dom</h3>
       <p>
           this is how to get all nodes
           <ul>
               <li>prepare spaceship</li>
               <li>prepare helmet</li>
               <li fxFor="let item of {{items}}">{{item}}</li>
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
  @Input() isVisible: boolean = true;

  lastname = 'Cavaliere';
  items = [faker.name.findName()];

  change(ev) {
    this.name = faker.name.findName();
    console.log('new name', this.name);
  }

  add() {
    this.items = [...this.items, faker.name.findName()];
  }

  toggleDescription() {
    this.isVisible = !this.isVisible;
  }
}
