import 'reflect-metadata';
import { getArguments } from '../utils';
import { injector } from '@microphi/di';
import { getBodyMetadata, getHeaderMetadata, getPathMetadata } from '../parameters/parameters.decorator';
import { LambdaDefaultHandler } from './handler';
import { Http } from 'serverless/aws';
import { getDebugger } from '@microphi/debug';

const d = getDebugger('microgamma:apigator:lambda');

export const LambdaMetadata = Symbol.for('Lambda');

// Partial is fine until the two only mandatory options in Http
// are path amd method.
// We do not need them mandatory for when we want to have a lambda as auth function
export interface LambdaOptions extends Omit<Partial<Http>, 'integration'> {
  name?: string;
  description?: string;
  integration?: 'lambda' | 'mock' | 'lambda-proxy';
}


export function Lambda(options: LambdaOptions) {

  // serverless-apigator sets integration = 'lambda' if integration is not defined
  options.integration = options.integration || 'lambda';

  return (target: any, key: string, descriptor) => {

    options.name = options.name || key;

    const lambdas = getLambdaMetadata(target).concat(options);

    Reflect.defineMetadata(LambdaMetadata, lambdas, target);

    const originalFunction = descriptor.value;

    descriptor.value = async function () {
      const functionArgumentsNames = getArguments(originalFunction);

      const handler: LambdaDefaultHandler = injector(LambdaDefaultHandler);

      // eslint-disable-next-line prefer-rest-params
      const args = arguments;

      d({ args });


      // here we have an array of string with names of arguments.
      /*
        i.e.: if function is defined such as:

        public function(id) {
        }

        then here we have ['id']

       */

      /*
      here we have the real args the function has been called with
      i.e.: in case of aws lambda; respectively event, context, cb

      [
        { id: '5b798b78a56340b78834026f' },
        { awsRequestId: 'id',
          invokeid: 'id',
          logGroupName: '/aws/lambda/microgamma-user-service--findById',
          logStreamName: '2015/09/22/[HEAD]13370a84ca4ed8b77c427af260',
          functionVersion: 'HEAD',
          isDefaultFunctionVersion: true,
          functionName: 'microgamma-user-service--findById',
          memoryLimitInMB: '1024',
          succeed: [Function: succeed],
          fail: [Function: fail],
          done: [Function: done],
          getRemainingTimeInMillis: [Function: getRemainingTimeInMillis] },
        [Function: callback] ]

       */


      // Important: surprisingly here `this` is not respected!
      // do not try to use it.
      const instance = injector(target.constructor);

      d(`got instance will use "${key}" method`);

      // const methodMetadata = getLambdaMetadata(this);

      /*
          At this point args is an array
          I.E.:
           - if running on AWS lambda would be [event, context, cb]
          and so on
       */

      // extract body
      const bodyParams = getBodyMetadata(instance, key);
      d({ bodyParams });

      const body = handler.getBody(args);
      d({ body });

      // extract path params
      const pathAnnotatedParams = getPathMetadata(instance, key);
      d({pathAnnotatedParams});

      const pathParams = handler.getPathParams(args);
      d({pathParams});

      // extract header params
      const headerAnnotatedParams = getHeaderMetadata(instance, key);

      const headerParams = handler.getHeaderParams(args);

      // TODO: extract query params

      // TODO: being able to alter the context or pass context to originalFunction

      // Make sure to add this so you can re-use `conn` between function calls.
      // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
      // eslint-disable-next-line no-prototype-builtins
      if (args[1] && args[1].hasOwnProperty('callbackWaitsForEmptyEventLoop')) {
        args[1].callbackWaitsForEmptyEventLoop = false;
      }

      const newArgs = new Array(functionArgumentsNames.length);

      // TODO: refactor here and decide what to do when a param cannot be found where is expected

      Object.keys(pathAnnotatedParams).forEach((param) => {
        const index = pathAnnotatedParams[param];
        newArgs[index] = pathParams[param];
      });

      Object.keys(bodyParams).forEach((param) => {
        const index = bodyParams[param];
        newArgs[index] = body;
      });

      Object.keys(headerAnnotatedParams).forEach((param) => {
        const index = headerAnnotatedParams[param];
        newArgs[index] = headerParams[param];
      });

      d({ newArgs });

      return handler.runOriginalFunction(originalFunction, instance, newArgs, args);

    };

    return descriptor;
  };

}

export function getLambdaMetadata(instance) {
  const metadata = Reflect.getMetadata(LambdaMetadata, instance);
  return metadata ? ([] as LambdaOptions[]).concat(metadata) : [];
}

export function getLambdaMetadataFromClass(klass) {
  const metadata = Reflect.getMetadata(LambdaMetadata, klass.prototype);
  return metadata ? ([] as LambdaOptions[]).concat(metadata) : [];
}
