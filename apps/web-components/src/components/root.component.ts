import { faker } from '@faker-js/faker';
import { Component, Input } from '@flux/core';

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
export class RootComponent {
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
