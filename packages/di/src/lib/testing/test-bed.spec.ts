import { TestBed } from './test-bed';
import { Injectable } from '../injctable/injectable.decorator';
import { Mocked } from './mocked';

describe('TestBed', () => {
  let instance: TestClassB;


  @Injectable()
  class TestClassB {
    say(name: string) {
      // console.log('hello')
    }
  }

  beforeEach(() => {
    TestBed.configure({
      providers: [
        {
          provide: TestClassB,
          useClass: Mocked(TestClassB),
        }
      ]
    });

    instance = TestBed.inject(TestClassB);
  });

  it('should create', () => {
    expect(instance).toBeTruthy();
  });

  it('should provide mocked class', () => {
    instance.say('superman');
    expect(instance.say).toHaveBeenCalledWith('superman');
  });

});
