import { HMap, HydrateFrom } from './hydrate-from.decorator';


fdescribe('@HydrateFrom', () => {

  class TestClass {

    @HydrateFrom(localStorage)
    public name!: string;

    @HydrateFrom(localStorage)
    public nickname: string = 'Superman';

    @HydrateFrom(localStorage)
    public obj!: any;

    @HydrateFrom(localStorage, {
      serializer: (v: Map<number, string>) => {
        return JSON.stringify([...v.entries()]);
      },
      parser: (entries: string) => {
        console.log('entries', entries);
        return new Map();
      }
    })
    public map!: HMap<string, number>;


    @HydrateFrom(localStorage)
    public nmap!: Map<string, number>;
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


  xdescribe('initial value should be overridden', () => {

    beforeEach(() => {
      const inst1 = new TestClass();
      inst1.nickname = 'Batman';

    });

    it('should read stored value', () => {

      const inst2 = new TestClass();
      expect(inst2.nickname).toEqual('Batman');
    });

  });

  describe('initial handle objects', () => {

    beforeEach(() => {
      const inst1 = new TestClass();
      inst1.obj = {
        test: 'A',
        B: true,
        nested: {
          A: 1,
          B: {
            third: 'level'
          }
        }
      };

    });

    it('should read stored value', () => {

      const inst2 = new TestClass();
      expect(inst2.obj).toEqual({
        test: 'A',
        B: true,
        nested: {
          A: 1,
          B: {
            third: 'level'
          }
        }
      });
    });

  });

  xdescribe('initial handle Map', () => {

    beforeEach(() => {
      const inst1 = new TestClass();
      inst1.map = new HMap();
      inst1.map.set('1', 1);
      inst1.map.set('3', 3);

    });

    it('should read stored value', () => {

      const inst2 = new TestClass();
      expect(inst2.map).toEqual(new Map());
    });

  });

});
