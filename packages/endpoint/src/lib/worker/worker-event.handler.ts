import { LambdaDefaultHandler, LambdaFunction, LambdaParams } from '../lambda/handler/lambda-default.handler';

/** what a `@Lambda` method is called with on Cloudflare Workers */
export interface WorkerCall {
  request: Request;
  /** decoded path parameters */
  params: Record<string, string>;
  /** the parsed JSON body, if the request has one */
  body?: unknown;
}

type WorkerArguments = [WorkerCall];

/**
 * Serves `@Lambda` methods on Cloudflare Workers (or any runtime with the
 * Fetch API): they are called with a `WorkerCall` and answer with a
 * `Response`. Use it through `worker(App)`, which builds the `WorkerCall`.
 */
export class WorkerEventHandler extends LambdaDefaultHandler {

  public override getBody([call]: WorkerArguments): unknown {
    return call.body;
  }

  public override getPathParams([call]: WorkerArguments): LambdaParams {
    return call.params;
  }

  /** from the request URL; a repeated parameter gives its first value */
  public override getQueryParams([call]: WorkerArguments): LambdaParams {
    const query: LambdaParams = {};
    new URL(call.request.url).searchParams.forEach((value, name) => { if (!(name in query)) query[name] = value; });
    return query;
  }

  /** header names are lowercase: use `@Header('authorization')` */
  public override getHeaderParams([call]: WorkerArguments): LambdaParams {
    const headers: LambdaParams = {};
    call.request.headers.forEach((value, name) => headers[name] = value);
    return headers;
  }

  public override async runOriginalFunction(originalFunction: LambdaFunction, instance: object, newArgs: unknown[]): Promise<Response> {
    try {
      const value = await originalFunction.apply(instance, newArgs);

      if (value instanceof Response) {
        return value;
      }

      return value === undefined ? new Response(null, { status: 204 }) : Response.json(value);
    } catch (e) {
      const error = this.handleError(e);

      // Response throws a RangeError outside 200-599
      const status = error.status >= 200 && error.status <= 599 ? error.status : 500;

      if (status >= 500) {
        console.error(error);
      }

      return Response.json(
        error.details === undefined ? { message: error.reason } : { message: error.reason, details: error.details },
        { status },
      );
    }
  }
}
