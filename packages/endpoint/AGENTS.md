# @microphi/endpoint — notes for coding agents

API endpoint decorators served on AWS Lambda, Express or MCP. Full docs: [README.md](README.md); errors: [ERRORS.md](ERRORS.md).

## Rules

- Requires `"experimentalDecorators": true`, `reflect-metadata`, and `@microphi/di`: an endpoint is `@Endpoint({ name })` **and** `@Injectable()`.
- Methods are exposed with `@Lambda({ method, path })`; parameters are bound with `@Path('name')`, `@Body()`, `@Header('name')`. Undecorated parameters receive `undefined`.
- Leave `@Lambda`'s `name` unset: it defaults to the method name, and tooling looks methods up by it.
- The platform is chosen by the handler provided in `@Serverless({ service, providers: [{ provide: LambdaDefaultHandler, useClass: AwsEventHandler | ExpressEventHandler | McpEventHandler }] })`, then `bootstrap(App)` returns the endpoint instance.
- Validate input by passing a [Standard Schema](https://standardschema.dev) (zod, valibot, arktype) to the parameter decorator: `@Body(UserSchema)`, `@Path('id', z.coerce.number())`. The method receives the schema's output; invalid input is a 400 with every issue in `details`. Don't validate by hand in the method.
- Throw `new HttpError(status, message)` for client errors; anything else becomes a 500.

## MCP

```typescript
const { tools, call } = mcpTools(UsersEndpoint); // app provides McpEventHandler
server.setRequestHandler(ListToolsRequestSchema, () => ({ tools }));
server.setRequestHandler(CallToolRequestSchema, (req, extra) => call(req.params.name, req.params.arguments, extra));
```

Tool names are `<endpoint name>_<method>`, descriptions come from `@Lambda({ description })`, input schemas from the parameter schemas (zod >= 4.2 and arktype emit JSON Schema; others fall back to `string` for path parameters and any for the body). Errors come back as `isError` results.

## Testing

Provide `LambdaTestingHandler` to call `@Lambda` methods with plain positional arguments (schemas still validate):

```typescript
TestBed.configure({
  providers: [UsersEndpoint, { provide: LambdaDefaultHandler, useClass: LambdaTestingHandler }],
});
await TestBed.inject(UsersEndpoint).findOne('42');
```
