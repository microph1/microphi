import 'reflect-metadata';
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import { injector, Klass } from '@microphi/di';
import { HttpError } from '../errors';
import { LambdaFunction } from './handler/lambda-default.handler';

export const AuthorizerMetadata = Symbol.for('Authorizer');

export interface AuthorizerOptions {
  name: string;
}

/**
 * Turn a method into an API Gateway custom authorizer. The method is called
 * with `(authorizationToken, methodArn)`; a truthy return value allows the
 * request and becomes the policy's `principalId` and `context.user`. Throw an
 * `HttpError` (or an error whose message starts with `[nnn]`) to deny with
 * that status.
 */
export function Authorizer(options?: AuthorizerOptions): MethodDecorator {
  return (target: object, key: string | symbol, descriptor: PropertyDescriptor) => {

    Reflect.defineMetadata(AuthorizerMetadata, {
      name: options ? options.name : String(key)
    }, target);

    const originalFunction: LambdaFunction = descriptor.value;

    descriptor.value = async function (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> {

      try {
        const instance = injector(target.constructor as Klass);

        const retValue = await originalFunction.apply(instance, [event.authorizationToken, event.methodArn]);

        const statement = {
          Action: 'execute-api:Invoke',
          Effect: retValue ? 'Allow' : 'Deny',
          Resource: event.methodArn.split('/')[0] + '/*',
        };

        return {
          principalId: retValue,
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              statement
            ],
          },
          context: {
            user: retValue
          }
        } as CustomAuthorizerResult;

      } catch (e) {
        throw HttpError.from(e);
      }
    };

    return descriptor;
  };
}

export function getAuthorizerMetadata(instance: object): AuthorizerOptions {
  return Reflect.getMetadata(AuthorizerMetadata, instance);
}

export function getAuthorizerMetadataFromClass(klass: Klass): AuthorizerOptions {
  return Reflect.getMetadata(AuthorizerMetadata, klass.prototype);
}
