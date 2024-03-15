import { Before } from './before.decorator';

describe('before decorator', () => {

  interface Params {
    a: string;
    b: {
      c: string;
      d: number;
    },
    e: string[];
  }

  class TestClass {

    public static log = jest.fn();

    @Before<string>((name) => {
      return name.toUpperCase();
    })
    public async simpleParamSimpleType(name: string) {
      return `hello ${name}`;
    }

    @Before(TestClass.log)
    public simpleParamSimpleTypeVoidBefore(name: string) {
      return `hello ${name}`;
    }

    @Before<[Params, boolean]>((params) => {
      return params;

    })
    public testInLineFunction({a, b}: Params) {

      return {
        a,
        ...b
      };
    }

    public changeCase(name: string) {
      return name.toUpperCase();
    }

    @Before<string>(function(name) {
      return this.changeCase(name);
    })
    public referringToThis(name: string) {
      return `Hello ${name}!`;
    }
  }


  let instance: TestClass;

  beforeEach(() => {
    instance = new TestClass();
  });

  it('should exists', () => {
    expect(instance).toBeTruthy();
  });

  it('should work with one param of simple type i.e.: string ', async () => {

    const retValue = await instance.simpleParamSimpleType('davide');

    expect(retValue).toEqual('hello DAVIDE');
  });

  it('should work with a void function', () => {
    expect(instance.simpleParamSimpleTypeVoidBefore('davide')).toEqual('hello davide');
    expect(TestClass.log).toHaveBeenCalled();

  });

  it('should be able to use inline functions', () => {

    expect(instance.testInLineFunction({
      a: 'test',
      b: {
        c: 'c',
        d: 122
      },
      e: ['test']
    })).toEqual({
      a: 'test',
      c: 'c',
      d: 122
    });

  });

  it('should be able to refer to `this`', () => {
    expect(instance.referringToThis('davide')).toEqual('Hello DAVIDE!');

  });

});
