import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { createItem, fibonacci } from './items-store';

@Component({
  selector: 'app-demo-change-detection-observables',
  template: `
    <mat-toolbar>
      <button mat-button (click)="addItem()">Add Item</button>
      <button mat-button (click)="addItem(10)">Add 10 Items</button>
      <button mat-button (click)="addItem(100)">Add 100 Items</button>
    </mat-toolbar>
    <div fxLayout="column" fxLayoutGap="7px">
      <ng-container *ngFor="let item of items$ | async">

        <app-item [item]="item" (remove)="removeItem(item)" (edit)="updateItem(item)"></app-item>
      </ng-container>
    </div>
  `,
})
export class DemoChangeDetectionObservablesComponent {


  @Input()
  items$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  addItem(total = 1) {
    for (let i = 0; i < total; i++) {

      const items = this.items$.getValue().concat(createItem());

      this.items$.next(items);
    }

  }

  updateItem(item) {
    item.a = fibonacci(Math.floor(Math.random() * 10));
    item.b = fibonacci(Math.floor(Math.random() * 10));

    this.items$.next(this.items$.getValue());

  }

  removeItem(item) {
    const items = this.items$.getValue();
    const idx = this.items$.getValue().findIndex((i) => i === item);
    items.splice(idx, 1);
    this.items$.next(items);
  }
}
