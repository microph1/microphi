import { faker } from '@faker-js/faker';
import { Component, Input } from '@flux/core';

/*
<!--   <style>-->
<!--        :host {-->
<!--            padding: 12px;-->
<!--        }-->
<!--   </style>-->
<!--   <fx-bpm></fx-bpm>-->

<!--   <fx-user firstname="{{name}}" lastname="{{lastname}}">-->
<!--     <small>tr: {{name}}</small>-->
<!--     <button (click)="change()">{{name}}</button>-->
<!--   </fx-user>-->

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
<!--   <fx-user firstname="{{name2}}" lastname="{{lastname2}}"></fx-user>-->

 */

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

    <div class="header">
      <div>{{name}} - {{lastname}}</div>
      <div class="fx-grow"></div>
      <button class="button is-primary" (click)="change()">Change</button>
    </div>
    <div class="content fx-column fx-grow">

        <div class="card">
           <fx-user firstname="{{name}}" lastname="{{lastname}}">
    <!--         <small>tr: {{name}}</small>-->
    <!--         <button (click)="change()">{{name}}</button>-->
           </fx-user>
        </div>




        <div>
            <button (click)="toggleDescription()">Toggle</button>
       </div>
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

    </div>
    <footer class="footer">
        <fx-user firstname="{{name}}" lastname="{{lastname}}"></fx-user>
    </footer>


  `,
})
export class RootComponent {
  @Input() name: string = 'Davide';
  @Input() isVisible: boolean = true;

  lastname = 'Cavaliere';

  items = [faker.name.findName()];

  change() {
    this.name = faker.name.firstName();
    this.lastname = faker.name.lastName();
  }

  add() {
    this.items = [...this.items, faker.name.findName()];
  }

  toggleDescription() {
    this.isVisible = !this.isVisible;
  }
}
