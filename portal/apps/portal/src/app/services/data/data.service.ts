import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  protected dbName: string = 'db';
  protected remote: false;
  private db;

  constructor() {
    this.db = new PouchDB(this.dbName);
  }

  public async findAll(options?) {
    const response = await this.db.allDocs({
      include_docs: true
    });

    return response.rows.map((elm) => {
      return elm.doc;
    });
  }

  public async save(item) {
    if (!item._id) {
      return await this.db.post(item);
    }

    return await this.db.put(item);
  }
}
