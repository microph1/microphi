import { getDebugger } from '@microphi/debug';
import MiniSearch, { Options } from 'minisearch';
import { close, exists, existsSync, mkdir, openSync, readFileSync, rmSync, rmdir, unlink, writeFile, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { Scheduler, Subject, asapScheduler, debounceTime, from, switchMap } from 'rxjs';
import { List } from '../list/list';

/**
 * Mark T as having auto trailing attributes
 *
 * `modified` and `created` iso string date;
 */
export type withAutoTrail<T> = T & {
  modified?: string;
  created?: string;
}

export type withId<T extends object> = T & {
  id: string;
}

export class JsonStorage<T extends object> {

  #l = getDebugger(`JsonStorage:${this.entity}`);

  syncPending$ = new Subject<boolean>();

  index = new List<withAutoTrail<{ id: string; path: string; }>>('id', []);

  get search(): MiniSearch<T> {
    if (!this._search) {
      throw Error(`Need to enable search by passing Minisearch Options to constructor. ${this.entity}`);
    }

    return this._search;
  }

  set search(value: MiniSearch<T>) {
    this._search = value;
  }

  private _search!: MiniSearch<T>;


  constructor(
    private entity: string,
    private basePath: string,
    searchIndexOptions?: Options,
    debounce?: number,
    private scheduler?: Scheduler,
  ) {

    this.index.operations$.pipe(
      debounceTime(debounce || 3_000, this.scheduler || asapScheduler),
      switchMap(() => {
        return from(this.saveIndex());
      })
    ).subscribe(() => {
      this.#l(`index has been quiet for ${debounce}ms. Updated`);
    });

    this.#l('creating service');

    if (searchIndexOptions) {
      this._search = new MiniSearch(searchIndexOptions);
    }

    this.getIndex().then((data) => {

      this.index.upsert(...data);

      this.#l(`loaded index for ${data.length} items`);
      this.#l('getting documents');

      const documents = [...this.index].map(({ id }) => {
        return this.get(id);
      });
      this.#l(`got ${documents.length} documents`);

      if (searchIndexOptions) {
        this.#l('reading files to generate search index');
        Promise.all(documents).then((actualDocs) => {

          this.#l('rebuilding search index with', actualDocs.length);

          actualDocs.forEach((doc) => {

            try {

              if (doc && doc['id']) {
                // this.l(`adding document with id ${doc['id']}`);

                this._search.add(doc);
              }

            } catch (err) {
              console.error('Error while loading entity into search index');
              this.#l(doc);
              // console.error(actualDocs);
              console.error(err);
            }

          });

          this.#l('search index rebuilt');
          this.#l(`handling ${this._search.documentCount} documents for free search`);

        });
      }
    });

  }

  async saveIndex() {
    const path = await this.storageFile('index');
    writeFileSync(path, JSON.stringify([...this.index]));
    return Promise.resolve('ok');
  }

  has(id: string) {
    return this.index.has(id);
  }

  async upsert(...docs: (withId<T>)[]) {

    for (const {id, ...doc} of docs) {
      const timestamp = new Date().toISOString();
      const updateTime = this.index.has(id) ? {
        modified: timestamp,
      } : {
        modified: timestamp,
        created: timestamp,
      };

      this.index.upsert({
        id: id,
        path: await this.storageFile(id),
        ...updateTime
      });

      await this.setItem(id, doc as T);

      if (this._search) {
        if (this._search.has(id)) {
          this._search.replace({id, ...doc} as T);
        } else {
          this._search.add({id, ...doc} as T);
        }
      }
    }

    return Promise.resolve();
  }

  async remove(...ids: string[]) {
    return new Promise((resolve, reject) => {

      for (const id of ids) {

        const entry = this.index.get(id);

        if (!entry) {
          resolve('ok');
        }

        this.get(id).then((doc) => {

          if (entry) {

            // remove index and search entry
            this.index.delete(entry);

            if (doc) {
              this._search?.remove(doc);
            }

            // finally remove json file
            unlink(entry.path, (err) => {
              if (err) reject(err);

              resolve('ok');
            });
          }


        });
      }

    });
  }

  getCount() {
    return this.index.size;
  }

  deleteAll() {
    this.index.clear();

    if (this._search) {
      this._search.removeAll();
    }

    return new Promise((resolve) => {
      exists(`${this.basePath}/${this.entity}`, (exists) => {
        if (exists) {

          rmSync(`${this.basePath}/${this.entity}`, { recursive: true });

        }

        resolve('ok');

      });
    });
  }

  getAll() {
    const items$ = [...this.index].map(({ id }) => this.get(id));

    return Promise.all(items$);
  }

  private async storageFile(key: string): Promise<string> {
    const path = this.buildPath(key);
    const folder = dirname(path);

    if (existsSync(path)) {
      return Promise.resolve(path);
    }

    return new Promise((resolve, reject) => {
      mkdir(folder, { recursive: true }, (err) => {
        if (err) reject(err);

        const fd = openSync(path, 'w');
        close(fd, (err) => {
          if (err) reject(err);

          resolve(path);
        });

      });
    });
  }

  private buildPath(id: string) {
    return join(this.basePath, this.entity, `${id}.json`);
  }

  async get(id: string): Promise<T|undefined> {
    const path = await this.storageFile(id);
    const data = readFileSync(path, {encoding: 'utf8'});
    let entity: T;

    try {

      entity = JSON.parse(data);

      return entity;
    } catch (e) {
      // console.log(e);
      this.#l(`error while trying to load data for item with id ${id}`);
      this.#l('item does not exists');
      this.#l('clearing index');
      this.index.delete({id, path});
    }

    return Promise.resolve(undefined);
  }


  private async getIndex(): Promise<{id: string; path: string;}[]> {
    const index = readFileSync(await this.storageFile('index'), {encoding: 'utf8'});
    return JSON.parse(index || '[]');
  }

  private async setItem(id: string, doc: T) {
    writeFileSync(join(this.basePath, this.entity, `${id}.json`), JSON.stringify({id, ...doc}));
    // this.l('wrote doc to disk', id, doc);
    return Promise.resolve('ok');
  }
}
