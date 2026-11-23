import { firstValueFrom, Observable, of, throwError } from 'rxjs';

import { Cache, CacheClockSymbol, CacheSymbol } from './cache.decorator';

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

  describe('with cacheErrors: false', () => {

    let fail: boolean;

    class Keyed {

      @Cache({ ttl: 10, cacheErrors: false })
      async describe(id: string): Promise<string> {
        spy(id);
        if (fail) throw new Error('no api key');
        return `text:${id}`;
      }

      @Cache({ ttl: 10, cacheErrors: false })
      stream(id: string): Observable<string> {
        spy(id);
        return fail ? throwError(() => new Error('no api key')) : of(`text:${id}`);
      }
    }

    let keyed: Keyed;

    beforeEach(() => {
      fail = true;
      keyed = new Keyed();
    });

    it('should evict a rejected promise so the next call runs again', async () => {
      await expect(keyed.describe('x')).rejects.toThrow('no api key');
      fail = false;

      await expect(keyed.describe('x')).resolves.toBe('text:x');
      await expect(keyed.describe('x')).resolves.toBe('text:x');
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should still share the pending promise with concurrent callers', async () => {
      const first = keyed.describe('x');
      expect(keyed.describe('x')).toBe(first);
      await expect(first).rejects.toThrow('no api key');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should evict an errored observable so the next call runs again', async () => {
      await expect(firstValueFrom(keyed.stream('x'))).rejects.toThrow('no api key');
      fail = false;

      await expect(firstValueFrom(keyed.stream('x'))).resolves.toBe('text:x');
      await expect(firstValueFrom(keyed.stream('x'))).resolves.toBe('text:x');
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should return a real Observable', () => {
      fail = false;
      expect(keyed.stream('x')).toBeInstanceOf(Observable);
    });

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

  it('should measure the ttl on the instance clock when it has one', () => {
    const clock = { time: 0, now() { return this.time; } };
    const calls = vi.fn();

    class Clocked {
      [CacheClockSymbol] = clock;

      @Cache({ ttl: 10 })
      read() {
        calls();
        return 'value';
      }
    }

    const clocked = new Clocked();
    clocked.read();
    clock.time = 10;
    clocked.read();
    expect(calls).toHaveBeenCalledTimes(1);

    clock.time = 11;
    clocked.read();
    expect(calls).toHaveBeenCalledTimes(2);
  });

});
