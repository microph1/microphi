import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { Miniflare } from 'miniflare';
import { Column, Entity, JsonColumn, PrimaryKey, SqlStorage } from './entity';
import { SqlDriver } from './driver';
import { SqliteStorage } from './sqlite-storage';
import { D1DatabaseLike, D1Driver } from './drivers/d1.driver';
import { NodeSqliteDriver } from './drivers/node-sqlite.driver';

@Entity('authors')
class Author {
  @PrimaryKey()
  id = '';

  @Column({ type: 'TEXT' })
  name = '';

  @Column({ type: 'INTEGER' })
  birthYear = 0;
}

@Entity('books')
class Book {
  @PrimaryKey()
  isbn = '';

  @Column({ type: 'TEXT', nullable: false })
  title = '';

  @Column({ type: 'TEXT' })
  authorId?: string;

  @Column({ type: 'REAL' })
  rating?: number;

  @Column({ type: 'BOOLEAN' })
  inPrint?: boolean;

  @JsonColumn()
  genres?: string[];
}

@SqlStorage([Author, Book])
class Library extends SqliteStorage {
  constructor(driver: SqlDriver) {
    super(driver);
  }
}

const tick = () => new Promise(resolve => setTimeout(resolve, 5));

let mf: Miniflare;

beforeAll(async () => {
  mf = new Miniflare({
    modules: true,
    script: 'export default { fetch() { return new Response(null); } }',
    d1Databases: ['DB'],
  });
  await mf.ready;
});

afterAll(async () => {
  await mf.dispose();
});

const drivers: [string, () => Promise<SqlDriver>][] = [
  ['node:sqlite', async () => NodeSqliteDriver.open(':memory:')],
  ['D1 (miniflare)', async () => new D1Driver(await mf.getD1Database('DB') as unknown as D1DatabaseLike)],
];

describe.each(drivers)('SqliteStorage over %s', (_name, createDriver) => {
  let library: Library;

  beforeEach(async () => {
    library = new Library(await createDriver());
    await library.migrate();
    await library.deleteAll('authors');
    await library.deleteAll('books');
  });

  afterEach(async () => {
    await library.close();
  });

  test('defaults to the first managed table', async () => {
    await library.upsert([{ id: 'a1', name: 'Jane Austen', birthYear: 1775 }]);

    const author = await library.get<Author>('a1');
    expect(author).toBeInstanceOf(Author);
    expect(author).toMatchObject({ id: 'a1', name: 'Jane Austen', birthYear: 1775 });
  });

  test('round-trips REAL, BOOLEAN and JSON columns', async () => {
    await library.table<Book>('books').upsert({
      isbn: 'b1', title: 'Emma', authorId: 'a1', rating: 4.5, inPrint: true, genres: ['comedy', 'romance'],
    });

    const book = await library.table<Book>('books').get('b1');
    expect(book).toMatchObject({ isbn: 'b1', title: 'Emma', rating: 4.5, inPrint: true, genres: ['comedy', 'romance'] });
  });

  test('writes omitted optional columns as NULL', async () => {
    await library.table<Book>('books').upsert({ isbn: 'b2', title: 'Untitled' });

    const book = await library.table<Book>('books').get('b2');
    expect(book).toMatchObject({ isbn: 'b2', title: 'Untitled', authorId: null, rating: null, inPrint: null, genres: null });
  });

  test('keeps created and moves modified on update', async () => {
    const books = library.table<Book>('books');
    await books.upsert({ isbn: 'b1', title: 'Emma' });
    const first = await books.getAutoTrail('b1');
    await tick();
    await books.upsert({ isbn: 'b1', title: 'Emma (2nd ed.)' });
    const second = await books.getAutoTrail('b1');

    expect(second!.created).toBe(first!.created);
    expect(second!.modified! > first!.modified!).toBe(true);
    expect((await books.get('b1'))!.title).toBe('Emma (2nd ed.)');
    expect(await books.getCount()).toBe(1);
  });

  test('upsert is atomic: one bad document writes nothing', async () => {
    const books = library.table<Book>('books');
    await expect(books.upsert(
      { isbn: 'b1', title: 'Emma' },
      { isbn: 'b2' } as Book, // title is NOT NULL
    )).rejects.toThrow();

    expect(await books.getCount()).toBe(0);
  });

  test('upsert rejects a document without its primary key', async () => {
    await expect(library.table<Book>('books').upsert({ title: 'No isbn' } as Book))
      .rejects.toThrow('document has no "isbn"');
  });

  test('has, getCount, getAll and getByIds', async () => {
    const authors = library.table<Author>('authors');
    await authors.upsert(
      { id: 'a1', name: 'Austen', birthYear: 1775 },
      { id: 'a2', name: 'Brontë', birthYear: 1816 },
      { id: 'a3', name: 'Eliot', birthYear: 1819 },
    );

    expect(await authors.has('a2')).toBe(true);
    expect(await authors.has('nope')).toBe(false);
    expect(await authors.getCount()).toBe(3);
    expect(await authors.getCount('birthYear > ?', [1800])).toBe(2);
    expect((await authors.getAll()).map(a => a.id).sort()).toEqual(['a1', 'a2', 'a3']);
    expect((await authors.getByIds(['a3', 'a1', 'missing'])).map(a => a.id).sort()).toEqual(['a1', 'a3']);
    expect(await authors.getByIds([])).toEqual([]);
  });

  test('getByIds and remove chunk past the driver parameter limit', async () => {
    const authors = library.table<Author>('authors');
    const docs = Array.from({ length: 150 }, (_, i) => ({ id: `a${i}`, name: `Author ${i}`, birthYear: 1800 + i }));
    await authors.upsert(...docs);

    expect(await authors.getByIds(docs.map(d => d.id))).toHaveLength(150);

    await authors.remove(...docs.slice(0, 120).map(d => d.id));
    expect(await authors.getCount()).toBe(30);
  });

  test('getPaged filters, orders and pages with bound parameters', async () => {
    const authors = library.table<Author>('authors');
    await authors.upsert(
      { id: 'a1', name: 'Austen', birthYear: 1775 },
      { id: 'a2', name: 'Brontë', birthYear: 1816 },
      { id: 'a3', name: 'Eliot', birthYear: 1819 },
      { id: 'a4', name: 'Woolf', birthYear: 1882 },
    );

    const page = await authors.getPaged({
      where: 'birthYear > ?', whereParams: [1800], orderBy: 'birthYear', orderDir: 'DESC', limit: 2, offset: 1,
    });
    expect(page.map(a => a.id)).toEqual(['a3', 'a2']);
    expect((await authors.getPaged({ orderBy: 'name' })).map(a => a.name)).toEqual(['Austen', 'Brontë', 'Eliot', 'Woolf']);
  });

  test('distinct column paging and counting', async () => {
    const books = library.table<Book>('books');
    await books.upsert({ isbn: 'b1', title: 'Emma', authorId: 'a1' });
    await tick();
    await books.upsert({ isbn: 'b2', title: 'Jane Eyre', authorId: 'a2' });
    await tick();
    await books.upsert({ isbn: 'b3', title: 'Persuasion', authorId: 'a1' });

    expect(await books.getDistinctColumnPaged('authorId')).toEqual(['a1', 'a2']);
    expect(await books.getDistinctColumnPaged('authorId', { orderDir: 'ASC', limit: 1 })).toEqual(['a1']);
    expect(await books.getDistinctColumnPaged('authorId', { where: 'title != ?', whereParams: ['Persuasion'] })).toEqual(['a2', 'a1']);
    expect(await books.countDistinctColumn('authorId')).toBe(2);
    expect(await books.countDistinctColumn('authorId', 'title = ?', ['Emma'])).toBe(1);
    await expect(books.getDistinctColumnPaged('nope')).rejects.toThrow('has no column "nope"');
  });

  test('getAllWithAutoTrail reports the primary key as id', async () => {
    await library.table<Book>('books').upsert({ isbn: 'b1', title: 'Emma' });

    const [trail] = await library.getAllWithAutoTrail('books');
    expect(trail.id).toBe('b1');
    expect(trail.created).toEqual(expect.any(String));
    expect(await library.getAutoTrail('missing', 'books')).toBeUndefined();
  });

  test('execDelete and deleteAll', async () => {
    const authors = library.table<Author>('authors');
    await authors.upsert(
      { id: 'a1', name: 'Austen', birthYear: 1775 },
      { id: 'a2', name: 'Brontë', birthYear: 1816 },
    );

    expect(await authors.execDelete('birthYear < ?', [1800])).toBe(1);
    expect(await authors.get('a1')).toBeUndefined();

    await authors.deleteAll();
    expect(await authors.getCount()).toBe(0);
  });

  test('throws for a table it does not manage', () => {
    expect(() => library.table('songs')).toThrow('Table "songs" is not managed by Library. Known tables: authors, books');
  });
});
