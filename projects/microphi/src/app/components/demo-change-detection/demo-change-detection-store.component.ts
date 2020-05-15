import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Item, ItemsActions, ItemsStore } from './items-store';
import { combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';


@Component({
  selector: 'app-demo-change-detection-store',
  template: `
    <mat-toolbar>
      <button mat-button (click)="addItem()">Add Item</button>
      <button mat-button (click)="addItem(10)">Add 10 Items</button>
      <button mat-button (click)="addItem(100)">Add 100 Items</button>
      <button mat-button (click)="addItem(500)">Add 500 Items</button>
    </mat-toolbar>
    <div fxLayout="column" fxLayoutGap="7px">
      <mat-progress-bar *ngIf="(loading$ | async)?.status" mode="indeterminate"></mat-progress-bar>
      <ng-container *ngFor="let item of (filteredItems$ | async)">
        <app-item [item]="item"
            (edit)="edit($event)"
            (remove)="remove($event)">
        </app-item>
      </ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoChangeDetectionStoreComponent implements OnInit {

  loading$ = this.itemsStore.loading$;

  items$: Observable<Item[]> = this.itemsStore.items$;
  filteredItems$ = combineLatest([this.items$, this.itemsStore.search$]).pipe(
    map(([items, search]) => {
      return items.filter((item) => {
        if (+search) {
          return item.a === +search || item.b === +search;
        }

        return true;
      });
    }),
  );

  constructor(private itemsStore: ItemsStore) {
  }

  ngOnInit(): void {
    this.itemsStore.dispatch(ItemsActions.GET);
  }

  addItem(total = 1) {
    this.itemsStore.dispatch(ItemsActions.ADD, total);
  }

  remove($event: any) {
    this.itemsStore.dispatch(ItemsActions.REMOVE, $event);
  }

  edit($event: any) {
    this.itemsStore.dispatch(ItemsActions.UPDATE, $event);
  }
}

