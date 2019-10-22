import { BehaviorSubject } from 'rxjs';

export class ObservableList<T extends {}> {
  private ids: string[] = [];
  private data: {
    [id: string]: BehaviorSubject<T>
  } = {};

  constructor(items: any[], private idFieldName = 'id') {
    for (const item of items) {
      this.ids.push(item.id);
      this.data[item.id] = new BehaviorSubject(item);
    }
  }

  *[Symbol.iterator](): IterableIterator<BehaviorSubject<T>> {
    // tslint:disable-next-line:forin
    for (const id in this.ids) {
      yield this.data[id];
    }
  }

  public push(...items: T[]) {
    const id = this.idFieldName;

    for (const item of items) {

      if (this.data.hasOwnProperty(item[id])) {
        // check whether the item changed;

        const storedItem = this.data[item[id]].getValue();
        const shouldUpdate = Object.keys(storedItem).some((key) => {
          return storedItem[key] !== item[key];
        });

        if (shouldUpdate) {
          this.data[item[id]].next(item);
        }
      } else {
        this.ids.push(item[id]);
        this.data[item[id]] = new BehaviorSubject(item);
      }

    }

  }

  public updateOne(item: T) {
    this.data[item[this.idFieldName]].next(item);
  }

  public toJSON() {

    const serialized = [];

    for (const item of this) {
      serialized.push(item.getValue());
    }

    return serialized;
  }
}
