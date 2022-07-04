/* eslint-disable @typescript-eslint/restrict-template-expressions,@typescript-eslint/ban-ts-comment */


import { Component, registerDirective, registerPipe, render } from './lib/component2';
import { Input } from './lib/input';
import { BehaviorSubject, delay, Observable } from 'rxjs';
import { faker } from '@faker-js/faker';


registerPipe('async', (source$) => {

  return `__#${source$}#__`;

});

registerPipe('async2', (source$: Observable<any>) => {
  //
  // let retValue = `__#will change when it comes#__`;
  //
  // source$.pipe().subscribe((value) => {
  //   console.log('got value in pipe async2', value);
  //   retValue = value;
  // }).unsubscribe();
  //
  // return retValue;

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

@Component({
  selector: 'fx-user',
  template: `

    <h1>Hello Mr. {{firstname}} - {{lastname}}</h1>
    <small>{{firstname | async}}</small>

    <div>
        with pipe: {{fullname$}}
    </div>
    <div>
        with internal subscription: {{fullnameAsync}}
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
  fullname$ = this._fullname.pipe(
    delay(500),
  );

  fullnameAsync: string = '';

  constructor() {
    this.fullname$.subscribe((name) => {
      console.log('new name', name);
      this.fullnameAsync = name;
    });
  }

  next() {
    const name = `${faker.name.firstName()} ${faker.name.lastName()}`;
    this._fullname.next(name);
    console.log('new name nexted', name);
  }
}


@Component({
  selector: 'fx-simple',
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
   <fx-user firstname="{{name2}}" lastname="{{lastname2}}"></fx-user>
  `
})
class FxSimpleComponent {
  @Input() name: string = 'Davide';
  @Input() name2: string = 'Davide2';
  @Input() isVisible: boolean = true;

  lastname = 'Cavaliere';
  lastname2 = 'Cavaliere2';
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
