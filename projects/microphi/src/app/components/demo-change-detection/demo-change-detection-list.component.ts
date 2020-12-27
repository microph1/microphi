import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { createItem, Item } from './items-store';
import { List } from '@microphi/store';

function uuidv4() {
  // tslint:disable-next-line:only-arrow-functions
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    // tslint:disable-next-line:no-bitwise triple-equals one-variable-per-declaration
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function createEntity() {
  return {
    id: uuidv4(),
    data: createItem()
  };
}

export interface Entity {
  id: string;
  data: Item;
}


@Component({
  selector: 'app-demo-change-detection-store',
  template: `
    <mat-toolbar>
      <button mat-button (click)="addItem(100)">Add 100 Items</button>
      <button mat-button (click)="addItem(500)">Add 500 Items</button>
      <button mat-button (click)="addItem(1000)">Add 1000 Items</button>
    </mat-toolbar>
    <div fxLayout="column" fxLayoutGap="7px">
<!--      <mat-progress-bar *ngIf="(loading$ | async)?.status" mode="indeterminate"></mat-progress-bar>-->
      <ng-container *ngFor="let item of items">
        <app-item [item]="item"
            (edit)="edit($event)"
            (remove)="remove($event)">
        </app-item>
      </ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoChangeDetectionListComponent {

  items: List<Entity> = new List('id');


  addItem(total = 1) {
    for (let i = 0; i < total; i++) {
      this.items.append(createEntity());
    }
  }

  remove($event: any) {
    this.items.delete($event);
  }

  edit($event: any) {
    console.log('editing', $event);
    $event.data = createItem();
    this.items.upsert($event);
  }
}

