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
}

export function fibonacci(num) {
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
  useLocalStorage: false,
})
@Injectable()
export class ItemsStore extends BaseStore<ItemsState> {

  search$ = new BehaviorSubject<string>('');

  items$ = this.store$.pipe(

    map((state) => state.items)
  );

  @Effect(ItemsActions.SEARCH)
  public onSearch(search) {
    this.search$.next(search);
  }

  // @Reduce(ItemsActions.SEARCH)
  // public search(items) {
  //   this.state.items = items;
  //   return this.state;
  // }

  @Reduce(ItemsActions.REMOVE)
  public removeItem(item) {
    const idx = this.state.items.findIndex((i) => i === item);
    this.state.items.splice(idx, 1);
    return this.state;
  }

  @Effect(ItemsActions.UPDATE)
  public onUpdate(item) {
    console.log('@Effect(UPDATE)', item);
    const itemIdx = this.state.items.findIndex((i) => {
      console.log('parsing', i);
      return i.a === item.a && i.b === item.b;
    });
    if (itemIdx < 0) {
      console.error('cannot find item', item);
    }
    console.log('original index', itemIdx);
    return of([createItem(), itemIdx]);
  }

  @Effect(ItemsActions.ADD)
  public onAddItem(total) {
    return of(total).pipe(delay(1000));
  }

  @Reduce(ItemsActions.ADD)
  public addItem(total) {
    for (let i = 0; i < total; i++) {
      this.state.items.push(createItem());
    }
    return this.state;
  }

  @Reduce(ItemsActions.UPDATE)
  public updateItem([item, itemIdx]) {
    this.state.items[itemIdx] = item;
    return this.state;
  }

  @Reduce(ItemsActions.GET)
  public getAll() {
    return this.state;
  }

}
