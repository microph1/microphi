import { LambdaDefaultHandler } from '../lambda/handler/lambda-default.handler';

export class LambdaTestingHandler extends LambdaDefaultHandler {

  public override async runOriginalFunction(originalFunction, instance, newArgs, originalArgs?): Promise<any> {
    return originalFunction.apply(instance, originalArgs);
  }
}
