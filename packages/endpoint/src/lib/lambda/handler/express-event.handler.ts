import { LambdaDefaultHandler } from './';

export class ExpressEventHandler extends LambdaDefaultHandler {

  public override getPathParams([req]): any {
    return req.params;
  }

  public override getHeaderParams([req]): any {
    return req.headers;
  }

  public override getBody([req]): any {
    return req.body;
  }

  public override async runOriginalFunction(originalFunction: any, instance: any, newArgs: any, [, res]): Promise<any> {

    try {
      const retValue = await originalFunction.apply(instance, newArgs);
      return res.json(retValue);
    } catch (e) {

      const message = e instanceof Error ? e.message : String(e);
      const match = message.match(/^\[([0-9]{3,})\](.)+/);

      if (match) {
        return res.status(+match[1]).json(message);
      } else {
        res.status(500).json(`[500] ${message}`);
      }

    }
  }
}
