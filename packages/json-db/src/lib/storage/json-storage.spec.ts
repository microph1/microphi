import { TestScheduler } from '@datakitchen/rxjs-marbles';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { JsonStorage } from './json-storage';

describe('json-storage', () => {
  interface User {
    id: string;
    name: string;
  }

  let storage: JsonStorage<User>;

  let scheduler: TestScheduler;

  beforeEach(() => {

    if (existsSync('.data')) {
      rmSync('.data', {recursive: true});
    }

    // TODO: fill in some initial data

    const user0 = { id: '0', name: 'user0' };
    const index = [{id: '0', path: '.data/users/0.json'}];

    if (!existsSync('.data')) {
      mkdirSync('.data');
    }

    if (!existsSync('.data/users')) {
      mkdirSync('.data/users');
    }

    // create entity file
    writeFileSync('.data/users/0.json', JSON.stringify(user0), { flag: 'wx' });
    // create index file
    writeFileSync('.data/users/index.json', JSON.stringify(index), { flag: 'wx' });

    scheduler = new TestScheduler();

    storage = new JsonStorage<User>('users', '.data', {
      fields: ['name'],
      idField: 'id',
    }, 0, scheduler);
  });


  it('should exists', () => {
    expect(storage).toBeTruthy();
  });

  it('should have loaded stored data', () => {

    expect(storage.getCount()).toEqual(1);
  });


  it('initialize minisearch', () => {
    const results = storage.search.search('anything');
    expect(results).toEqual([]);
  });

  describe('storing documents', () => {
    beforeEach(async () => {
      await storage.upsert({id: '1', name: 'superman'});
    });

    it('should have updated the index', () => {
      expect(storage.has('1')).toBeTruthy();
    });

    it('should update index.json file', async () => {

      // manually force saveIndex index for now
      // I can't find a better way to check this
      await storage.saveIndex();
      const indexFile = readFileSync('.data/users/index.json', 'utf8');
      const data = JSON.parse(indexFile);
      expect(data).toEqual(expect.arrayContaining([{
        created: expect.anything(),
        modified: expect.anything(),
        id: '1',
        path: '.data/users/1.json',
      }]));


    });

    it('should create a new file for the document', () => {

      expect(existsSync('.data/users/1.json')).toBeTruthy();
      const file = readFileSync('.data/users/1.json', 'utf8');
      const data = JSON.parse(file);
      expect(data).toEqual({
        id: '1', name: 'superman',
      });
    });

    it('should count the number of documents stored', () => {
      expect(storage.getCount()).toEqual(2);
    });

    it('get all documents', async () => {

      const docs = await storage.getAll();

      expect(docs).toEqual(expect.arrayContaining([{id: '1', name: 'superman'}]));
    });

    it('remove a document', async () => {

      await storage.remove('1');

      expect(storage.getCount()).toEqual(1);
      expect(existsSync('.data/users/1.json')).toBeFalsy();

    });


    it('remove all documents', async () => {

      await storage.deleteAll();
      expect(storage.getCount()).toEqual(0);
      expect(existsSync('.data/users/1.json')).toBeFalsy();
    });

    describe('update a document', () => {

      it('update an existing document', async () => {

        await storage.upsert({id: '1', name: 'super-superman'});
        const user = await storage.get('1');
        expect(user).toEqual({id: '1', name: 'super-superman'});
      });


    });
  });

  describe('retrieve a document', () => {

    it('should retrieve a document from disk if exists', async () => {

      await storage.upsert({id: '2', name: 'batman'});

      const hero = await storage.get('2');
      expect(hero).toEqual({id: '2', name: 'batman'});

    });

    it('should return undefined if a document does not exists', async () => {

      const hero = await storage.get('2');
      expect(hero).toEqual(undefined);
    });

  });
});
