import { HttpError } from '../../errors';
import { LambdaDefaultHandler, LambdaFunction, LambdaParams } from './lambda-default.handler';

/** the part of Express' request the handler reads */
export interface ExpressRequestLike {
  params: LambdaParams;
  headers: LambdaParams;
  body?: unknown;
}

/** the part of Express' response the handler writes */
export interface ExpressResponseLike {
  status(code: number): ExpressResponseLike;
  json(body: unknown): unknown;
}

type ExpressArguments = [ExpressRequestLike, ExpressResponseLike];

export class ExpressEventHandler extends LambdaDefaultHandler {

  public override getPathParams([req]: ExpressArguments): LambdaParams {
    return req.params;
  }

  public override getHeaderParams([req]: ExpressArguments): LambdaParams {
    return req.headers;
  }

  public override getBody([req]: ExpressArguments): unknown {
    return req.body;
  }

  public override async runOriginalFunction(originalFunction: LambdaFunction, instance: object, newArgs: unknown[], [, res]: ExpressArguments): Promise<unknown> {

    try {
      const retValue = await originalFunction.apply(instance, newArgs);
      return res.json(retValue);
    } catch (e) {
      const error = HttpError.from(e);

      // errors with details (validation issues) answer with an object, the
      // others keep answering with the `[status] message` string
      return res.status(error.status).json(error.details === undefined
        ? error.message
        : { message: error.message, details: error.details });
    }
  }
}
