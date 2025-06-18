import { TestBed } from './test-bed';
import { Mocked } from './mocked';
import { Injectable } from '../lib/injctable/injectable.decorator';

describe('TestBed', () => {
  let instance: TestClassB;


  @Injectable()
  class TestClassB {
    say(name: string) {
      // console.log('hello')
      return name;
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
