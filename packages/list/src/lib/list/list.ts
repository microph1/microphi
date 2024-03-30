import { Subject } from 'rxjs';
import { $Keys, FunctionKeys } from 'utility-types';


export interface Operation {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  op: FunctionKeys<List<any>>;
  payload?: unknown;
  timestamp: Date;
}

export class List<EntityType extends object> implements Iterable<EntityType> {

  public operations$ = new Subject<Operation>();

  public readonly entities = new Map<string, EntityType>();

  /**
   * maps entities position from the original array to their ids
   */
  private readonly ids: string[] = [];

  public get size() {
    if (this.ids.length !== this.entities.size) {

      throw new Error(`Size Mismatch ${this.ids.length} !== ${this.entities.size}`);
    }

    return this.entities.size;
  }

  public has(id: string) {
    return this.entities.has(id);
  }

  public get(id: string) {
    return this.entities.get(id);
  }

  private getId(entity: EntityType): string {
    return entity[this.IDField] as string;
  }

  constructor(private IDField: $Keys<EntityType>, entities: EntityType[] = []) {

    this.ids = entities.map((e) => this.getId(e));

    entities
      .forEach((item) => {
        const id = this.getId(item);
        this.entities.set(id, item);
      });
  }

  *[Symbol.iterator](): IterableIterator<EntityType> {
    for (const idx in this.ids) {
      const id = this.ids[idx];

      const entity = this.entities.get(id);
      if (entity) {
        yield entity;
      } else {
        throw new Error(`Cannot get entity with id ${id}`);
      }
    }
  }

  /**
  * Upsert one or more items. I.e.: append if new update otherwise
  * */
  public upsert(...entities: EntityType[]) {
    entities.forEach((e) => {
      const id = this.getId(e);

      if (!this.entities.has(id)) {
        this.ids.push(id);
      }

      this.entities.set(id, e);

    });

    this.operations$.next({ op: 'upsert', payload: entities, timestamp: new Date() });
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
    this.operations$.next({ op: 'prepend', payload: entities, timestamp: new Date() });
  }

  public clear() {

    this.ids.length = 0;
    this.entities.clear();
    this.operations$.next({ op: 'clear', timestamp: new Date() });

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

    this.operations$.next({ op: 'delete', payload: entities, timestamp: new Date() });
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

    this.operations$.next({ op: 'append', payload: entities, timestamp: new Date() });
  }


}
