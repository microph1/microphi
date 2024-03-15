import { Mocked, WithMock } from './mocked';
import isMockFunction = jest.isMockFunction;
import mock = jest.mock;

describe('Mocked', () => {

  const spy = jest.fn();

  class BaseClass {
    baseMethod() {}
  }

  class TestClass extends BaseClass {

    methodOne() {}
    methodTwo() {}

    willNotBeMocked() {
      spy();
    }

    willBeMockedWithCustomImplementation() {
      return [];
    }
  }

  let mockedInstance: WithMock<TestClass>;

  beforeEach(() => {
    const MockedClass = Mocked(TestClass, {
      willNotBeMocked: 'NO_MOCK',
      willBeMockedWithCustomImplementation: jest.fn().mockReturnValue(['jello']),
    });

    // Normally both `TestClass` and `MockedClass` instatiation will be handled
    // by TestBed and so no error will be show
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mockedInstance = new MockedClass();

  });

  it('should create', () => {
    expect(mockedInstance).toBeTruthy();
    expect(mockedInstance instanceof TestClass);
  });

  it('should mock base class methods', () => {
    mockedInstance.baseMethod();
    expect(mockedInstance.baseMethod).toHaveBeenCalled();
  });

  it('should mock the methods in TestClass', () =>  {
    expect(isMockFunction(mockedInstance.methodOne)).toBeTruthy();
    expect(isMockFunction(mockedInstance.methodTwo)).toBeTruthy();
  });

  it('should not mock method', () => {
    mockedInstance.willNotBeMocked();
    expect(spy).toHaveBeenCalled();
  });

  it('should use custom implementation', () => {
    expect(mockedInstance.willBeMockedWithCustomImplementation()).toEqual(['jello']);
  });

});