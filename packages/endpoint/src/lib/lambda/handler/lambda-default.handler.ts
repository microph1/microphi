import { Injectable } from '@microphi/di';
import { HttpError } from '../../errors';

/** a `@Lambda` method as the handler calls it */
export type LambdaFunction = (...args: unknown[]) => unknown;

/** path or header parameters by name */
export type LambdaParams = Record<string, unknown>;

/**
 * Binds `@Lambda` methods to a platform: extracts body, path and header
 * parameters from the arguments the platform calls the handler with, and
 * turns the method's result (or error) into the platform's response.
 *
 * Provide a subclass in `@Serverless({ providers: [{ provide: LambdaDefaultHandler, useClass: ... }] })`.
 */
@Injectable()
export class LambdaDefaultHandler {

  // the default handler is a pass-through: it calls the method with the
  // original arguments, so these only return what they are given

  public getBody(args: unknown[]): unknown {
    return args;
  }

  public getPathParams(args: unknown[]): LambdaParams {
    return args as unknown as LambdaParams;
  }

  public getHeaderParams(args: unknown[]): LambdaParams {
    return args as unknown as LambdaParams;
  }

  /**
   * @param originalFunction - the decorated method
   * @param instance - the endpoint instance to call it on
   * @param _newArgs - the method's arguments, extracted with the getters above
   * @param originalArgs - the arguments the platform called the handler with
   */
  public async runOriginalFunction(originalFunction: LambdaFunction, instance: object, _newArgs: unknown[], originalArgs: unknown[] = []): Promise<unknown> {
    try {
      return await originalFunction.apply(instance, originalArgs);
    } catch (e) {
      throw this.handleError(e);
    }
  }

  protected handleError(e: unknown): HttpError {
    return HttpError.from(e);
  }
}
