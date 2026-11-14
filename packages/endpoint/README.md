# @microphi/endpoint [![npm](https://img.shields.io/npm/v/@microphi/endpoint)](https://www.npmjs.com/package/@microphi/endpoint)

> Decorators for API endpoints (`@Endpoint`, `@Lambda`, `@Body`, `@Path`) served on AWS Lambda, Express, Cloudflare Workers or as MCP tools, with Standard Schema validation; their metadata also drives the serverless.yml functions block

Formerly `@microgamma/apigator`. Decorate a class with `@Endpoint` and its methods with `@Lambda`; the metadata they record is read at runtime to bind each method to a platform (AWS Lambda, Express.js, Cloudflare Workers or MCP), and by the [serverless-apigator](https://github.com/davidecavaliere/-microgamma/blob/master/packages/serverless-apigator/README.md) plugin to generate the `functions` section of `serverless.yml`.

## Install

```sh
npm i @microphi/endpoint @microphi/di @microphi/debug reflect-metadata
```

Enable legacy decorators in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

## How to use

Define an endpoint. It is an [`@microphi/di`](../di) injectable, so it can `@Inject` other services:

```typescript
import { Injectable } from '@microphi/di';
import { Body, Endpoint, Lambda, Path } from '@microphi/endpoint';

@Endpoint({ name: 'users', cors: true })
@Injectable()
export class UsersEndpoint {

  @Lambda({ method: 'GET', path: '/users/{id}' })
  findOne(@Path('id') id: string) {
    return { id };
  }

  @Lambda({ method: 'POST', path: '/users' })
  create(@Body() user: { name: string }) {
    return user;
  }
}
```

Wire it into an app with `@Serverless`, choosing the handler for the platform it runs on, and bootstrap it:

```typescript
import { AwsEventHandler, bootstrap, LambdaDefaultHandler, Serverless } from '@microphi/endpoint';

@Serverless({
  service: UsersEndpoint,
  providers: [
    { provide: LambdaDefaultHandler, useClass: AwsEventHandler },
  ],
})
class App {}

// the endpoint instance: each @Lambda method is now a handler for that platform
export const users = bootstrap(App);
// AWS Lambda: export each method as a function handler, e.g. users.findOne
```

## Decorators

### `@Endpoint(options)`

| Option | |
|---|---|
| `name` | endpoint name (required) |
| `basePath` | prepended to every `@Lambda` path |
| `private` | default for every `@Lambda` in the class; a `@Lambda` setting wins |
| `cors` | same as `private` |

### `@Lambda(options)`

Records the metadata and wraps the method in an async function that pulls its arguments out of the platform call (`event, context` on AWS, `request, response` on Express) through the configured handler.

| Option | |
|---|---|
| `method`, `path` | HTTP verb and path |
| `integration` | `'lambda'` (default), `'lambda-proxy'` or `'mock'` |
| `private`, `cors`, `authorizer` | as in `serverless.yml` |
| `name`, `description` | `name` defaults to the method name; don't set it |

### Parameters

| Decorator | Injects |
|---|---|
| `@Path('id')` | a path parameter |
| `@Body()` | the request body |
| `@Header('Authorization')` | a header |

#### Validation

Each parameter decorator takes an optional [Standard Schema](https://standardschema.dev) (zod, valibot, arktype, ...). The value is validated before the method runs, and the method receives the schema's output (coerced, defaulted):

```typescript
import { z } from 'zod';

const User = z.object({ name: z.string().describe('the user name') });

@Lambda({ method: 'PUT', path: '/users/{id}' })
update(@Path('id', z.coerce.number()) id: number, @Body(User) user: z.infer<typeof User>) {
  // id is a number, user is valid
}
```

Invalid input is a 400 `HttpError` listing every issue (`id: Invalid input: expected number, received NaN; body.name: ...`), with the issues as an array in `details`.

### `@Authorizer`

Turns a method into an API Gateway custom authorizer: its return value becomes the policy's `context.user`; throw an `HttpError` (or an error whose message starts with `[nnn]`) to deny with that status.

## Errors

Throw `HttpError` for anything that is not a 500:

```typescript
import { HttpError } from '@microphi/endpoint';

throw new HttpError(404, `user ${id} not found`);
```

Its message is `[404] user 42 not found`, the form API Gateway's `lambda` integration matches with `selectionPattern`; plain errors with a `[nnn]` prefix keep working, anything else is a 500. See [ERRORS.md](ERRORS.md) for how each handler answers.

## Handlers

| Handler | Platform |
|---|---|
| `AwsEventHandler` | AWS Lambda |
| `ExpressEventHandler` | Express.js (responds with `res.json`, errors with their status) |
| `WorkerEventHandler` | Cloudflare Workers, or any Fetch API runtime (see below) |
| `McpEventHandler` | MCP tools (see below) |
| `LambdaTestingHandler` | tests: passes the arguments straight through |

With Express, paths use the `:param` notation (`/users/:id`) and each lambda is mounted with its metadata:

```typescript
import express from 'express';
import { getLambdaMetadataFromClass } from '@microphi/endpoint';

const app = express();
const users = bootstrap(App); // App provides ExpressEventHandler

for (const lambda of getLambdaMetadataFromClass(UsersEndpoint)) {
  app[lambda.method.toLowerCase()](lambda.path, users[lambda.name]);
}

app.listen(3000);
```

### Cloudflare Workers

Provide `WorkerEventHandler` and export the router `worker(App)` returns; the app is bootstrapped once, when the module loads:

```typescript
import { LambdaDefaultHandler, Serverless, worker, WorkerEventHandler } from '@microphi/endpoint';

@Serverless({
  service: UsersEndpoint, // @Endpoint({ name: 'users', basePath: '/api' })
  providers: [{ provide: LambdaDefaultHandler, useClass: WorkerEventHandler }],
})
class App {}

export default worker(App);
```

- `service` can be a list, `@Serverless({ service: [UsersEndpoint, ProjectsEndpoint] })`: the worker routes across all of them (each with its own `basePath`, `Allow` merged), and throws at startup when two lambdas answer the same method and path. `bootstrap` returns the first one.
- Paths use the AWS notation: `{id}` matches a segment, `{path+}` the rest of the path; values are URI-decoded and `basePath` is prepended. Literal segments win over parameters (`/users/me` before `/users/{id}`).
- A JSON request body (`application/json`, `*+json`) is parsed for `@Body()`; invalid JSON is a 400. Header names are lowercase: `@Header('authorization')`.
- A method answers with its value as JSON (200), with 204 when it returns `undefined`, or with the `Response` it returns, untouched. Errors answer `{ message, details? }` with their status; 5xx are also logged with `console.error`.
- `fetch` answers 404 when no path matches, and 405 with `Allow` when the path matches but the method doesn't. `route(request)` returns `undefined` in both cases instead, to fall through to something else:

```typescript
const api = worker(App);

export default {
  fetch: (request: Request, env: Env) => api.route(request) ?? env.ASSETS.fetch(request),
};
```

Bindings are not passed to the methods: read them with `import { env } from 'cloudflare:workers'`. The adapter only uses the Fetch API (`Request`, `Response`), so it runs, and is tested, in Node as well.

### MCP

The same endpoint can be served to AI agents as [Model Context Protocol](https://modelcontextprotocol.io) tools. Provide `McpEventHandler`, and answer `tools/list` and `tools/call` with `mcpTools` (the endpoint must be bootstrapped first):

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { bootstrap, LambdaDefaultHandler, McpEventHandler, mcpTools, Serverless } from '@microphi/endpoint';

@Serverless({
  service: UsersEndpoint,
  providers: [{ provide: LambdaDefaultHandler, useClass: McpEventHandler }],
})
class McpApp {}

bootstrap(McpApp);

const { tools, call } = mcpTools(UsersEndpoint);

const server = new Server({ name: 'users', version: '1.0.0' }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, () => ({ tools }));
server.setRequestHandler(CallToolRequestSchema, (req, extra) => call(req.params.name, req.params.arguments, extra));

await server.connect(new StdioServerTransport());
```

Each `@Lambda` becomes a tool:

- name: `<endpoint name>_<method>`, e.g. `users_findOne`;
- description: the `@Lambda` `description`, followed by the route;
- input: one property per `@Path` parameter, plus `body` for the `@Body`. With a schema that implements [Standard JSON Schema](https://standardschema.dev/json-schema) (zod >= 4.2, arktype) the property is that JSON Schema, `.describe()` included; without one, path parameters are strings and the body is anything.

Headers come from the transport (`extra.requestInfo.headers` on HTTP transports), not from the tool input. Results are returned as JSON text; errors, validation included, as `isError` results with `{ status, message, details }`, so the model can read them and retry.

`getMcpToolDefinitions(Endpoint)` returns the tool definitions alone.

## Metadata

`getEndpointMetadataFromClass`, `getLambdaMetadataFromClass`, `getAuthorizerMetadataFromClass` and `getServerlessMetadataFromClass` return what the decorators recorded; serverless-apigator uses them to generate `serverless.yml`.

The `service` option of `@Serverless` is a class or a list of classes: `serviceList(getServerlessMetadataFromClass(App).service)` always gives the list.

## Testing

Provide `LambdaTestingHandler` to call `@Lambda` methods with plain arguments:

```typescript
import { TestBed } from '@microphi/di';
import { LambdaDefaultHandler, LambdaTestingHandler } from '@microphi/endpoint';

TestBed.configure({
  providers: [
    UsersEndpoint,
    { provide: LambdaDefaultHandler, useClass: LambdaTestingHandler },
  ],
});

const users = TestBed.inject(UsersEndpoint);
await users.findOne('42');
```
