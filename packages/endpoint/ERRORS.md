# @microphi/endpoint errors

Request errors are `HttpError`s: `error.status` is the HTTP status, `error.details` carries machine readable context, and the message keeps the `[status] message` form API Gateway's `lambda` integration matches on (`selectionPattern: '^\[404\].*'`).

Throw them from `@Lambda` methods:

```typescript
throw new HttpError(404, `user ${id} not found`);
```

Errors that are not `HttpError` become one: a message starting with `[nnn]` keeps that status, anything else is a 500.

| Status | Thrown by | Details |
|---|---|---|
| 400 | a `@Path`, `@Body` or `@Header` schema rejected the value | the issues, as `name.path: message` strings |
| 500 | anything else the method threw | |

How each handler answers:

| Handler | Answer |
|---|---|
| `AwsEventHandler` | rejects with the `HttpError` |
| `ExpressEventHandler` | `res.status(status).json(message)`, or `json({ message, details })` when there are details |
| `McpEventHandler` | an `isError` tool result whose text is `{ status, message, details }` |
