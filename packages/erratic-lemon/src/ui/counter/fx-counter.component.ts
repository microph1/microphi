import { Component } from '@microphi/flux';

@Component({
  selector: 'fx-counter',
  template: `
      <div class="fx-flex fx-flex-row fx-gap-3">
        <fx-label>{{label}}</fx-label>
        <div>{{counter}}</div>
        <div>
          <button (click)="increase()">+</button>
          <button (click)="decrease()">-</button>
        </div>
      </div>
    `
})
export class FxCounterComponent {
  label = 'Count Potatoes';
  counter = 1;

  increase() {
    this.counter++;
  }

  decrease() {
    this.counter--;
  }
}
