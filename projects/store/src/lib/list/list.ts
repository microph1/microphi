import { $Keys } from 'utility-types';

// eslint-disable-next-line @typescript-eslint/ban-types
export class List<EntityType extends {}> implements Iterable<EntityType> {

  public readonly entities = new Map<any, EntityType>();

  /**
   * maps entities position from the original array to their ids
   */
  private readonly ids: any[] = [];

  public get size() {
    if (this.ids.length !== this.entities.size) {

      throw new Error(`Size Mismatch ${this.ids.length} !== ${this.entities.size}`);
    }

    return this.entities.size;
  }

  public get(id) {
    return this.entities.get(id);
  }
  private getId(entity: EntityType) {
    return entity[this.IDField];
  }

  constructor(private IDField: $Keys<EntityType>, entities: EntityType[] = []) {

    this.ids = entities.map((e) => this.getId(e));

    entities
      .forEach((item) => {
        const id = item[IDField];
        this.entities.set(id, item);
      });
  }

  *[Symbol.iterator](): IterableIterator<EntityType> {
    // tslint:disable-next-line:forin
    for (const idx in this.ids) {
      const id = this.ids[idx];
      yield this.entities.get(id);
    }
  }

  public upsert(...entities: EntityType[]) {
    entities.forEach((e) => {
      const id = this.getId(e);

      if (!this.entities.has(id)) {
        this.ids.push(id);
      }

      this.entities.set(id, e);
    });
  }

  public prepend(...entities: EntityType[]) {
    entities.reverse().forEach((e) => {
      const id = this.getId(e);

      if (this.entities.has(id)) {
        this.delete(e);
      }

      this.ids.unshift(id);

      this.entities.set(id, e);

    });
  }

  public delete(...entities: EntityType[]) {
    entities.forEach((e) => {
      const id = this.getId(e);
      const indexOfId = this.ids.findIndex((_id) => _id === id);

      if (indexOfId >= 0) {
        this.ids.splice(indexOfId, 1);
        this.entities.delete(id);
      }
    });
  }

  public append(...entities: EntityType[]) {
    entities.forEach((e) => {
      const id = this.getId(e);

      if (this.entities.has(id)) {
        this.delete(e);
      }

      this.ids.push(id);
      this.entities.set(id, e);
    });
  }
}
