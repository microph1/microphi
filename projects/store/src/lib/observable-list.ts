import { BehaviorSubject } from 'rxjs';

export class ObservableList<T extends {}> {
  private ids: Set<string> = new Set<string>();
  private data: Map<string, BehaviorSubject<T>> = new Map();
  //
  // private data: {
  //   [id: string]: BehaviorSubject<T>
  // } = {};

  constructor(items: any[], private idFieldName = 'id') {
    for (const item of items) {
      this.ids.add(item.id);
      // this.data[item.id] = new BehaviorSubject(item);
      this.data.set(item.id, new BehaviorSubject(item));
    }
  }

  *[Symbol.iterator](): IterableIterator<BehaviorSubject<T>> {


    // tslint:disable-next-line:forin
    for (const id of this.ids.values()) {
      yield this.data.get(id);
      // yield this.data[id];
    }

  }

  public push(...items: T[]) {
    const id = this.idFieldName;

    for (const item of items) {

      if (this.data.has(item[id])) {
        // check whether the item changed;

        const storedItem = this.data.get(item[id]).getValue();
        const shouldUpdate = Object.keys(storedItem).some((key) => {
          return storedItem[key] !== item[key];
        });

        if (shouldUpdate) {
          this.data.get(item[id]).next(item);
        }
      } else {
        this.ids.add(item[id]);
        this.data.set(item[id], new BehaviorSubject(item));
      }

    }

  }

  public updateOne(item: T) {
    if (this.data.has(item[this.idFieldName])) {

      this.data.get(item[this.idFieldName]).next(item);
    }
  }

  public toJSON() {

    const serialized = [];

    for (const item of this) {
      serialized.push(item.getValue());
    }

    return serialized;
  }
}
