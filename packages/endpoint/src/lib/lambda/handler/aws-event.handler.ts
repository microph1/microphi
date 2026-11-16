import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';
import { LambdaDefaultHandler, LambdaFunction, LambdaParams } from './lambda-default.handler';

type AwsLambdaArguments = [APIGatewayEvent, APIGatewayEventRequestContext];

export class AwsEventHandler extends LambdaDefaultHandler {

  public override getBody([event]: AwsLambdaArguments): unknown {
    return event.body;
  }

  public override getPathParams([event]: AwsLambdaArguments): LambdaParams {
    // with the `lambda` integration the mapping template puts path parameters in `path`
    return (event as unknown as { path?: LambdaParams }).path || event.pathParameters || {};
  }

  public override getHeaderParams([event]: AwsLambdaArguments): LambdaParams {
    return event.headers;
  }

  /** REST (v1) and HTTP API / function URL (v2) events both carry `queryStringParameters` */
  public override getQueryParams([event]: AwsLambdaArguments): LambdaParams {
    return event.queryStringParameters ?? {};
  }

  public override async runOriginalFunction(originalFunction: LambdaFunction, instance: object, newArgs: unknown[]): Promise<unknown> {
    try {
      return await originalFunction.apply(instance, newArgs);
    } catch (e) {
      throw this.handleError(e);
    }
  }
}
