import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Effect, makeStore, Reduce, Store } from '@microphi/store';

export interface Item {
  a: number;
  b: number;
}

interface ItemsState {
  items: Item[];
  filteredItems: Item[];
}

interface ItemsActions {
  add: (total: number) => Observable<number>;
  update: (item) => Observable<any>;
  remove: (item: Item) => Observable<Item>;
  search: (text: string) => Observable<string>;
}

export function fibonacci(num) {
  let a = 1, b = 0, temp;

  while (num >= 0) {
    temp = a;
    a = a + b;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
    b: fibonacci(seedB)
  };
}


@Injectable()
export class ItemsStore extends Store<ItemsState, ItemsActions> implements makeStore<ItemsState, ItemsActions> {


  items$ = this.select((state) => state.items);

  constructor() {
    super({
      items: [],
      filteredItems: []
    });
  }

  @Effect()
  add(total: number): Observable<number> {
    return of(total).pipe(delay(1000));
  }

  @Reduce()
  onAdd(state: ItemsState, total: number): ItemsState {
    for (let i = 0; i < total; i++) {
      state.items.push(createItem());
    }
    return state;
  }

  @Effect()
  remove(item: Item): Observable<Item> {
    return of(item);
  }

  @Reduce()
  onRemove(state: ItemsState, payload: Item): ItemsState {
    const idx = state.items.findIndex((i) => i === payload);
    state.items.splice(idx, 1);
    return state;
  }

  @Reduce()
  onUpdate(state: ItemsState, item: Item): ItemsState {
    const itemIdx = state.items.findIndex((i) => {
      return i === item;
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    state.items[itemIdx] = item;
    return state;
  }

  @Effect()
  update(item: Item): Observable<Item> {
    return of(item);
  }

  @Reduce()
  onSearch(state: ItemsState, text: string): ItemsState {


    return {
      ...state,
      filteredItems: state.items.filter((i) => text.includes(i.a.toString()) ||text.includes(i.b.toString())),
    };
  }

  @Effect()
  search(text: string): Observable<string> {
    return of(text);
  }



}
