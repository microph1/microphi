import { Injectable, TestBed } from '@microphi/di';
import { Endpoint } from '../../';
import { Body, Header, Path } from '../parameters/parameters.decorator';
import { LambdaTestingHandler } from '../testing';
import { LambdaDefaultHandler } from './handler';
import { getLambdaMetadata, getLambdaMetadataFromClass, Lambda, LambdaOptions } from './lambda.decorator';

describe('@Lambda', () => {

  const option1: LambdaOptions = {
    method: 'get',
    name: 'lambda-name-1',
    path: '/'
  };

  const option2: LambdaOptions = {
    method: 'get',
    name: 'lambda-name-2',
    path: ':id',
    integration: 'lambda-proxy'
  };

  @Endpoint({
    name: 'endpoint',
  })
  @Injectable()
  class TestClass {

    public readonly toTestAccessToInstance: string = 'base';

    @Lambda(option1)
    public findAll(@Body() arg1, @Path('pathArg1') arg2, @Header('Authorization') arg3) {
      return {
        base: this.toTestAccessToInstance,
        body: arg1,
        other: arg2 + arg3
      };
    }

    @Lambda(option2)
    public findOne() {
      return 1;
    }
  }

  let instance: TestClass;

  beforeEach(() => {
    TestBed.configure({
      providers: [
        TestClass,
        { provide: LambdaDefaultHandler, useClass: LambdaTestingHandler}
      ],

    });

    instance = TestBed.inject(TestClass);

  });

  it('should store some metadata', () => {
    expect(getLambdaMetadata(instance)).toEqual([option1, option2]);
  });

  it('should get metadata from class', () => {
    expect(getLambdaMetadataFromClass(TestClass)).toEqual([option1, option2]);
  });

  it('findAll method should return 2: promised', async () => {

    const resp = await instance.findAll({
      a: 'b',
      c: 'd'
    }, 'my-value', 'abcdefghilmnopqrstuvz');

    expect(resp).toEqual({
      base: 'base',
      body: {
        a: 'b',
        c: 'd'
      },
      other: 'my-valueabcdefghilmnopqrstuvz'
    });

  });

  it('should resolve pathParameters field if integration is "lambda-proxy"', async () => {
    const resp = await instance.findOne.apply(instance, [
      { // when serverless integration is set to lambda-proxy
        // path contains the path as a string
        // pathParameters contains the mapped parameters
        pathParameters: {
          arg1: 1,
          arg2: 2,
          arg3: 3
        }
      },
      { context: 'a' } // context
    ]);

    expect(resp).toEqual(1);

  });
});
