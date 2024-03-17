import { Component, Input } from '@flux/core';
import { faker } from '@faker-js/faker';

@Component({
  selector: 'fx-root',
  // shadowRoot: true,
  style: `
    <style>
      h1 {
        color: black
      }
    </style>
  `,
  template: `
    <div class="header m-1">
      <div>{{name}} - {{lastname}}</div>
      <div class="fx-grow"></div>
      <button class="button is-primary" (click)="change()">Change</button>
    </div>
    <div class="content fx-column fx-grow m-4 mt-8">

        <div class="card p-3">
           <fx-user firstname="{{name}}" lastname="{{lastname}}">
            <div></div>
             <small>tr: {{name}}</small>
             <button (click)="change()">{{name}}</button>
           </fx-user>

           <p>
                <h4>non trascluded items</h4>
                <code>
                    {{items}}
                </code>
               <button (click)="add()">add</button>
           </p>
        </div>

       <fx-accordion label="How to traverse the dom" class="mt-6">
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

       </fx-accordion>


    </div>
    <footer class="footer">
        <fx-user firstname="{{name}}" lastname="{{lastname}}"></fx-user>
    </footer>


  `
})
export class FxRootComponent {
  @Input() name: string = 'Davide';
  lastname = 'Cavaliere';

  items = [faker.name.findName()];

  change() {
    this.name = faker.name.firstName();
    this.lastname = faker.name.lastName();
  }

  add() {
    this.items = [...this.items, faker.name.findName()];
  }

}
