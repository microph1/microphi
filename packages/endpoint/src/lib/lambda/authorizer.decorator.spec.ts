import { Lambda, LambdaOptions } from './lambda.decorator';
import { Authorizer, Endpoint, getAuthorizerMetadataFromClass } from '../../';
import { Injectable, TestBed } from '@microphi/di';

describe('@Authorizer', () => {

  const option1: LambdaOptions = {
    method: 'get',
    name: 'lambda-name-1',
    path: '/'
  };

  const option2: LambdaOptions = {
    method: 'get',
    name: 'lambda-name-2',
    path: ':id'
  };

  @Endpoint({
    name: 'endpoint'
  })
  @Injectable()
  class TestClass {

    public readonly toTestAccessToInstance: string = 'base';

    @Lambda(option1)
    public findAll(arg1, arg2, arg3) {
      return this.toTestAccessToInstance + arg1 + arg2 + arg3;
    }

    @Lambda(option2)
    public findOne() {
      return 1;
    }

    @Authorizer()
    public async authorize(token, resource): Promise<boolean> {
      return token.scope.some(value => value === resource);
    }
  }



  let instance;

  beforeEach(() => {
    TestBed.configure({
      providers: [
        TestClass,
      ]
    });

    instance = TestBed.inject(TestClass);
  });

  it('should get metadata from class', () => {
    expect(getAuthorizerMetadataFromClass(TestClass)).toEqual({name: 'authorize'});
  });


  it('should run the authorizer', async () => {

    const result = await instance.authorize.apply(instance, [{
      authorizationToken: {
        scope: ['some-method-arn']
      },
      methodArn: 'some-method-arn'
    }]);


    expect(result).toEqual({

      principalId: true,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: 'some-method-arn/*',
          },

        ],
      },
      context: {
        user: true
      }
    });

  });


});
