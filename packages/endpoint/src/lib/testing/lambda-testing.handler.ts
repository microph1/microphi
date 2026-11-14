import { LambdaDefaultHandler, LambdaFunction } from '../lambda/handler/lambda-default.handler';

/** passes the arguments a `@Lambda` method is called with straight through */
export class LambdaTestingHandler extends LambdaDefaultHandler {

  public override async runOriginalFunction(originalFunction: LambdaFunction, instance: object, _newArgs: unknown[], originalArgs: unknown[] = []): Promise<unknown> {
    return originalFunction.apply(instance, originalArgs);
  }
}
