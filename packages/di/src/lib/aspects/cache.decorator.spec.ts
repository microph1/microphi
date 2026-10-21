import { Cache, CacheSymbol } from './cache.decorator';

describe('@Cache', () => {

  const spy = vi.fn();

  // a plain class: nothing pre-seeds the cache map
  class SongDb {

    @Cache({ ttl: 10, trackBy: (id: string) => id })
    async fetchCoverArt(id: string): Promise<string> {
      spy(id);
      return `cover:${id}`;
    }

    @Cache({ ttl: 10 })
    async failing(id: string): Promise<string> {
      spy(id);
      throw new Error(`not found ${id}`);
    }

    @Cache()
    sum(a: number, b: number): number {
      spy(a, b);
      return a + b;
    }
  }

  let now: number;
  let instance: SongDb;

  beforeEach(() => {
    now = 1_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    spy.mockReset();
    instance = new SongDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should lazily create the cache on a non-store instance', () => {
    expect(CacheSymbol in instance).toBe(false);

    instance.sum(1, 2);

    expect((instance as unknown as Record<symbol, unknown>)[CacheSymbol]).toBeInstanceOf(Map);
  });

  it('should dedupe concurrent callers by sharing the pending promise', async () => {
    const first = instance.fetchCoverArt('album-1');
    const second = instance.fetchCoverArt('album-1');

    expect(second).toBe(first);
    await expect(Promise.all([first, second])).resolves.toEqual(['cover:album-1', 'cover:album-1']);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should call again for a different key', async () => {
    await instance.fetchCoverArt('album-1');
    await instance.fetchCoverArt('album-2');

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should call again once ttl is expired', async () => {
    await instance.fetchCoverArt('album-1');
    now += 11;
    await instance.fetchCoverArt('album-1');

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should cache a rejected promise within ttl', async () => {
    await expect(instance.failing('x')).rejects.toThrow('not found x');
    await expect(instance.failing('x')).rejects.toThrow('not found x');

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should cache synchronous return values keyed by serialized arguments', () => {
    expect(instance.sum(1, 2)).toBe(3);
    expect(instance.sum(1, 2)).toBe(3);
    expect(instance.sum(2, 1)).toBe(3);

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should not share the cache between instances', () => {
    instance.sum(1, 2);
    new SongDb().sum(1, 2);

    expect(spy).toHaveBeenCalledTimes(2);
  });

});
