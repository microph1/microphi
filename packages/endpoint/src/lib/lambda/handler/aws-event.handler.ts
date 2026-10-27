import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';
import { LambdaDefaultHandler } from './';

type AwsLambdaArguments = [APIGatewayEvent, APIGatewayEventRequestContext];

export class AwsEventHandler extends LambdaDefaultHandler {

  public override getBody([event]: AwsLambdaArguments) {
    return event.body;
  }

  public override getPathParams([event]: AwsLambdaArguments) {
    return event.path || event.pathParameters;
  }

  public override getHeaderParams([event]: AwsLambdaArguments) {
    return event.headers;
  }

  public override async runOriginalFunction(originalFunction, instance, newArgs) {
    try {

      return originalFunction.apply(instance, newArgs);

    } catch (e) {
      throw this.handleError(e);
    }
  }
}
