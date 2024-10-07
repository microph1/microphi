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

});
