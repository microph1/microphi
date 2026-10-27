import 'reflect-metadata';
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import { injector } from '@microphi/di';

export const AuthorizerMetadata = Symbol.for('Authorizer');

export interface AuthorizerOptions {
  name: string;
}

export function Authorizer(options?: AuthorizerOptions) {
  return (target: any, key: string, descriptor) => {

    Reflect.defineMetadata(AuthorizerMetadata, {
      name: options ? options.name : key
    }, target);

    const originalFunction = descriptor.value;

    descriptor.value = async function () {
      // eslint-disable-next-line prefer-rest-params
      const args = arguments;

      try {
        const instance = injector(target.constructor);

        const event: CustomAuthorizerEvent = args[0] as CustomAuthorizerEvent;

        const newArgs = [event.authorizationToken, event.methodArn];

        const retValue = await originalFunction.apply(instance, newArgs);

        // authContext.requestContext.identity.user = retValue;

        // context.indentity = retValue;
        // d('setting identity', context.indentity);

        const statement = {
          Action: 'execute-api:Invoke',
          Effect: retValue ? 'Allow' : 'Deny',
          Resource: event.methodArn.split('/')[0] + '/*',
        };

        const policy = {
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


        return policy;
      } catch (e) {

        const message = e instanceof Error ? e.message : String(e);
        if (message.match(/^\[[0-9]{3,}\](.)+/)) {
          throw new Error(String(e), { cause: e });
        }

        throw new Error(`[500] ${e}`, { cause: e });
      }
    };

    return descriptor;
  };
}

export function getAuthorizerMetadata(instance): AuthorizerOptions {
  return Reflect.getMetadata(AuthorizerMetadata, instance);
}

export function getAuthorizerMetadataFromClass(klass): AuthorizerOptions {
  return Reflect.getMetadata(AuthorizerMetadata, klass.prototype);
}
