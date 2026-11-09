# @microphi/endpoint — notes for coding agents

API endpoint decorators served on AWS Lambda, Express, Cloudflare Workers or MCP. Full docs: [README.md](README.md); errors: [ERRORS.md](ERRORS.md).

## Rules

- Requires `"experimentalDecorators": true`, `reflect-metadata`, and `@microphi/di`: an endpoint is `@Endpoint({ name })` **and** `@Injectable()`.
- Methods are exposed with `@Lambda({ method, path })`; parameters are bound with `@Path('name')`, `@Body()`, `@Header('name')`. Undecorated parameters receive `undefined`.
- Leave `@Lambda`'s `name` unset: it defaults to the method name, and tooling looks methods up by it.
- The platform is chosen by the handler provided in `@Serverless({ service, providers: [{ provide: LambdaDefaultHandler, useClass: AwsEventHandler | ExpressEventHandler | WorkerEventHandler | McpEventHandler }] })`, then `bootstrap(App)` returns the endpoint instance.
- Validate input by passing a [Standard Schema](https://standardschema.dev) (zod, valibot, arktype) to the parameter decorator: `@Body(UserSchema)`, `@Path('id', z.coerce.number())`. The method receives the schema's output; invalid input is a 400 with every issue in `details`. Don't validate by hand in the method.
- Throw `new HttpError(status, message)` for client errors; anything else becomes a 500.

## MCP

```typescript
const { tools, call } = mcpTools(UsersEndpoint); // app provides McpEventHandler
server.setRequestHandler(ListToolsRequestSchema, () => ({ tools }));
server.setRequestHandler(CallToolRequestSchema, (req, extra) => call(req.params.name, req.params.arguments, extra));
```

Tool names are `<endpoint name>_<method>`, descriptions come from `@Lambda({ description })`, input schemas from the parameter schemas (zod >= 4.2 and arktype emit JSON Schema; others fall back to `string` for path parameters and any for the body). Errors come back as `isError` results.

## Cloudflare Workers

```typescript
@Serverless({ service: SpeakersEndpoint, providers: [{ provide: LambdaDefaultHandler, useClass: WorkerEventHandler }] })
class App {}

export default worker(App); // { fetch, route }
```

- Paths use `{param}` (and `{param+}` for the rest of the path), prefixed by `@Endpoint({ basePath })`; literal segments win over parameters.
- Header names are lowercase: `@Header('authorization')`.
- A JSON content type is parsed into `@Body()` (invalid JSON is a 400); other bodies are not read.
- Return a value (200 JSON), `undefined` (204) or a `Response` (passed through). Errors answer `{ message, details? }` with their status; 5xx are logged with `console.error`.
- No route: 404; path matched but not the method: 405 with `Allow`. `route(request)` returns `undefined` instead, to fall through (e.g. to static assets).
- Methods don't receive `env`: read bindings with `import { env } from 'cloudflare:workers'`.
- Query strings are not bound to parameters.

## Testing

Provide `LambdaTestingHandler` to call `@Lambda` methods with plain positional arguments (schemas still validate):

```typescript
TestBed.configure({
  providers: [UsersEndpoint, { provide: LambdaDefaultHandler, useClass: LambdaTestingHandler }],
});
await TestBed.inject(UsersEndpoint).findOne('42');
```
