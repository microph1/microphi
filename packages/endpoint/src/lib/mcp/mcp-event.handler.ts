import { HttpError } from '../errors';
import { LambdaDefaultHandler, LambdaFunction, LambdaParams } from '../lambda/handler/lambda-default.handler';

/**
 * The arguments of an MCP `tools/call`: one property per `@Path` parameter
 * and `body` for the `@Body` one.
 */
export type McpToolInput = Record<string, unknown> & { body?: unknown };

/** the part of the MCP SDK's `RequestHandlerExtra` the handler reads */
export interface McpToolExtra {
  requestInfo?: {
    headers?: Record<string, string | string[] | undefined>;
  };
}

/** an MCP `CallToolResult` */
export interface McpToolResult {
  [key: string]: unknown;
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

type McpArguments = [McpToolInput | undefined, McpToolExtra | undefined];

/**
 * Serves `@Lambda` methods as MCP tools: they are called with
 * `(toolArguments, extra)` and answer with a `CallToolResult`. Errors are
 * returned as `isError` results rather than thrown, so the model can read
 * them and retry (the MCP spec reserves protocol errors for unknown tools).
 */
export class McpEventHandler extends LambdaDefaultHandler {

  public override getBody([input]: McpArguments): unknown {
    return input?.body;
  }

  public override getPathParams([input]: McpArguments): LambdaParams {
    return input ?? {};
  }

  public override getHeaderParams([, extra]: McpArguments): LambdaParams {
    return extra?.requestInfo?.headers ?? {};
  }

  public override async runOriginalFunction(originalFunction: LambdaFunction, instance: object, newArgs: unknown[]): Promise<McpToolResult> {
    try {
      const value = await originalFunction.apply(instance, newArgs);

      return {
        content: [{ type: 'text', text: value === undefined ? '' : JSON.stringify(value) }],
      };
    } catch (e) {
      const error = HttpError.from(e);

      return {
        isError: true,
        content: [{
          type: 'text',
          text: JSON.stringify({ status: error.status, message: error.reason, details: error.details }),
        }],
      };
    }
  }
}
