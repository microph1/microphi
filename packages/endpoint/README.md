# @microphi/endpoint [![npm](https://img.shields.io/npm/v/@microphi/endpoint)](https://www.npmjs.com/package/@microphi/endpoint)

> Decorators for API endpoints (`@Endpoint`, `@Lambda`, `@Body`, `@Path`) whose metadata drives AWS Lambda and Express handlers and the serverless.yml functions block

Formerly `@microgamma/apigator`. Decorate a class with `@Endpoint` and its methods with `@Lambda`; the metadata they record is read at runtime to bind each method to a provider (AWS Lambda or Express.js), and by the [serverless-apigator](https://github.com/davidecavaliere/-microgamma/blob/master/packages/serverless-apigator/README.md) plugin to generate the `functions` section of `serverless.yml`.

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

### `@Authorizer`

Turns a method into an API Gateway custom authorizer: its return value becomes the policy's `context.user`; throw an error whose message starts with `[401]` (any `[nnn]`) to deny with that status.

## Handlers

| Handler | Platform |
|---|---|
| `AwsEventHandler` | AWS Lambda |
| `ExpressEventHandler` | Express.js (responds with `res.json`, maps `[nnn] message` errors to that status) |
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

## Metadata

`getEndpointMetadataFromClass`, `getLambdaMetadataFromClass`, `getAuthorizerMetadataFromClass` and `getServerlessMetadataFromClass` return what the decorators recorded; serverless-apigator uses them to generate `serverless.yml`.

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
