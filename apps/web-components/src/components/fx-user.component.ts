import { BehaviorSubject, delay } from 'rxjs';
import { faker } from '@faker-js/faker';
import { Component, Input } from '@flux/core';
import styles  from './fx-user.styles.scss';


@Component({
  selector: 'fx-user',
  // shadowRoot: true,
  template: `
    <style>
        ${styles}
    </style>
    <h1>Hello Mr. {{firstname}} - {{lastname}}</h1>
    <small><b>with pipe:</b> {{firstname | async}}</small>

    <div>
        <b>automatically handle observables:</b> {{fullname$}}
    </div>
    <div>
        with internal subscription: {{fullnameAsync}}
    </div>
    <button class="button is-text" (click)="next()">next</button>

    <div class="container">
        <!-- TODO: resolve content projection -->
        <!-- slotting does not work without shadowDOM-->
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
      console.log('-------------------------new name------------------', name);
      this.fullnameAsync = name;
    });
  }

  next() {
    const name = `${faker.name.firstName()} ${faker.name.lastName()}`;
    this._fullname.next(name);
    console.log('new name nexted', name);
  }
}
