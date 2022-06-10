import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { createItem, fibonacci } from './items-store';

@Component({
  selector: 'app-demo-change-detection-immutables',
  template: `
    <mat-toolbar>
      <button mat-button (click)="addItem()">Add Item</button>
      <button mat-button (click)="addItem(10)">Add 10 Items</button>
      <button mat-button (click)="addItem(100)">Add 100 Items</button>
    </mat-toolbar>
    <div fxLayout="column" fxLayoutGap="7px">
      <ng-container *ngFor="let item of items">
        <app-item [item]="item" (remove)="removeItem(item)" (edit)="updateItem(item)"></app-item>
      </ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoChangeDetectionImmutablesComponent {
  @Input()
  items = [];

  addItem(total = 1) {
    for (let i = 0; i < total; i++) {
      const newItem = createItem();

      // immutables approach will work with change detection on push
      this.items = [...this.items, newItem];

    }

    // not immutable will not trigger change detection
    // this.items.push(newItem);

  }

  updateItem(item) {

    item.a = fibonacci(Math.floor(Math.random() * 20));
    item.b = fibonacci(Math.floor(Math.random() * 20));

    // this will trigger change detections
    this.items = [...this.items];
  }

  removeItem(item) {
    const idx = this.items.findIndex((i) => i === item);

    this.items.splice(idx, 1);

    // this will trigger change detection
    this.items = [...this.items];
  }
}
