import { Injectable } from '@angular/core';
import { BaseStore, Effect, Reduce, Store } from '@microphi/store';
import { delay, map } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';

export interface Item {
  a: number;
  b: number;
}

interface ItemsState {
  items: Item[];
  filteredItems: Item[];
}

export enum ItemsActions {
  ADD,
  PUSH,
  UPDATE,
  REMOVE,
  GET,
  SEARCH,
  VALIDATE_STORED_TOKEN,
}

export function fibonacci(num) {
  // tslint:disable-next-line:one-variable-per-declaration
  let a = 1, b = 0, temp;

  while (num >= 0) {
    temp = a;
    a = a + b;
    b = temp;
    num--;
  }

  return b;
}

export function createItem() {
  const seedA = Math.floor(Math.random() * 100);
  const seedB = Math.floor(Math.random() * 100);
  return {
    a: fibonacci(seedA),
    b: fibonacci(seedB),
  };
}


@Store({
  name: 'ItemsStore',
  initialState: {items: []},
  actions: ItemsActions,
})
@Injectable()
export class ItemsStore extends BaseStore<ItemsState, ItemsActions> {

  search$ = new BehaviorSubject<string>('');

  items$ = this.store$.pipe(
    map((state) => state.items)
  );

  @Effect(ItemsActions.SEARCH)
  public onSearch(search) {
    this.search$.next(search);
  }

  @Reduce(ItemsActions.REMOVE)
  public removeItem(state, item) {
    const idx = state.items.findIndex((i) => i === item);
    state.items.splice(idx, 1);
    return state;
  }

  @Effect(ItemsActions.ADD)
  public onAddItem(total) {
    return of(total).pipe(delay(1000));
  }

  @Reduce(ItemsActions.ADD)
  public addItem(state, total) {
    for (let i = 0; i < total; i++) {
      state.items.push(createItem());
    }
    return state;
  }

  @Reduce(ItemsActions.UPDATE)
  public updateItem(state, item) {
    const itemIdx = state.items.findIndex((i) => {
      return i === item;
    });
    state.items[itemIdx] = item;
    return state;
  }

  @Reduce(ItemsActions.GET)
  public getAll(state) {
    return state;
  }

}
