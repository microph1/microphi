import { BehaviorSubject } from 'rxjs';

export class ObservableList<T extends {}> {
  private readonly ids: Set<string> = new Set<string>();
  private data: Map<string, BehaviorSubject<T>> = new Map();

  private static difference(setA, setB): Set<string> {
    const _difference: Set<string> = new Set(setA);
    for (const elem of setB) {
      _difference.delete(elem);
    }
    return _difference;
  }

  private static intersection(setA, setB): Set<string> {
    const _intersection: Set<string> = new Set();
    for (const elem of setB) {
      if (setA.has(elem)) {
        _intersection.add(elem);
      }
    }
    return _intersection;
  }

  private static symmetricDifference(setA, setB): Set<string> {
    const _difference: Set<string> = new Set(setA);
    for (const elem of setB) {
      if (_difference.has(elem)) {
        _difference.delete(elem);
      } else {
        _difference.add(elem);
      }
    }
    return _difference;
  }

  constructor(items: T[], private idFieldName = 'id') {
    const ids = items.map((i) => i[this.idFieldName]);
    this.ids = new Set(ids);
    for (const id of ids) {
      this.data.set(id, new BehaviorSubject(items[id]));
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

    const data = [];

    this.data.forEach((value) => {
      data.push(value.getValue());
    });

    return data;
  }

  /**
   * Will update items that are already present only if they need to be updated and remove items that are not present.
   * @param items items of the list
   */
  public set(...items: T[]): void {
    const newIds: string[] = items.map((i) => i[this.idFieldName]);

    const intersection: Set<string> = ObservableList.intersection(this.ids, newIds);

    for (const id of intersection) {
      this.updateOne(items[id]);
    }

    const itemsToRemove: Set<string> = ObservableList.difference(this.ids, newIds);

    for (const id of itemsToRemove) {
      this.removeItem(id);
    }

    const itemsToAdd: Set<string> = ObservableList.difference(newIds, this.ids);

    for (const id of itemsToAdd) {
      this.addItem(items[id]);
    }

  }

  /**
   * Remove an item from the list given its id
   * @param id id of the item to remove
   */
  public removeItem(id: string) {
    this.ids.delete(id);
    this.data.delete(id);
  }

  /**
   * Adds an new item to the list
   * @param item the item to be added
   */
  private addItem(item: T) {
    const id = item[this.idFieldName];
    this.ids.add(id);
    this.data.set(id, new BehaviorSubject(item));

  }
}
