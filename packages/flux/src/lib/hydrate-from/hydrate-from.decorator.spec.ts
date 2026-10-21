import { HydrateFrom } from './hydrate-from.decorator';

describe('@HydrateFrom', () => {

  class TestClass {

    @HydrateFrom(localStorage)
    public name!: string;
  }

  it('should create', () => {
    expect(new TestClass()).toBeTruthy();
  });

  describe('localStorage is empy', () => {
    it('should default to undefined', () => {

      const ins = new TestClass();
      expect(ins.name).toBeUndefined();
    });

  });

  describe('localStorage is set', () => {

    beforeEach(() => {
      const inst1 = new TestClass();
      inst1.name = 'Batman';
    });

    it('should get initial value from localStorage', () => {
      const inst2 = new TestClass();
      expect(inst2.name).toEqual('Batman');
    });

  });

  describe('custom parser and serializer', () => {

    class MapHolder {
      @HydrateFrom(localStorage, {
        serializer: (v: Map<string, number>) => JSON.stringify([...v.entries()]),
        parser: (v: string) => new Map<string, number>(JSON.parse(v) || []),
      })
      public scores!: Map<string, number>;
    }

    it('should store the serialized value and read it back through the parser', () => {
      new MapHolder().scores = new Map([['alice', 3], ['bob', 5]]);

      expect(localStorage.getItem('MapHolder_###_scores')).toEqual('[["alice",3],["bob",5]]');

      const scores = new MapHolder().scores;
      expect(scores).toBeInstanceOf(Map);
      expect(scores.get('bob')).toEqual(5);
    });

  });

});
