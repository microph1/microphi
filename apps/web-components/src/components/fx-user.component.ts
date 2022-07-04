import { BehaviorSubject, delay } from 'rxjs';
import { faker } from '@faker-js/faker';
import { Component, Input } from '@flux/core';

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
export class FxUserComponent {
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
