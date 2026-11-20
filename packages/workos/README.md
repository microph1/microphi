# @microphi/workos

WorkOS AuthKit, both ends, plus a fake WorkOS for tests and local dev.

```sh
npm install @microphi/workos
```

| Entry | For | |
|---|---|---|
| `@microphi/workos` | APIs (Node, Lambda, Workers) | `WorkosVerifier`: verify access tokens, resolve the caller's email |
| `@microphi/workos/angular` | Angular ≥ 19 apps | `provideAuthKit`, `AuthKit` (signals), `authKitInterceptor`, `signedIn`, `authKitCallback` |
| `@microphi/workos/testing` | tests, local dev | `TestIssuer` (signs tokens, serves the JWKS and users API), `fakeAuthKit` (AuthKit client without WorkOS) |

ESM only.

## API

```ts
import { WorkosAuthError, WorkosVerifier } from '@microphi/workos';

const auth = new WorkosVerifier({
  clientId: process.env.WORKOS_CLIENT_ID!,
  apiKey: process.env.WORKOS_API_KEY,   // only to look up emails missing from tokens
});

const userId = await auth.requireUser(request.headers.get('authorization'));       // 401 when anonymous or invalid
const { id, email } = await auth.requireIdentity(request.headers.get('authorization')); // email lowercase
await auth.userId(header);                                                           // undefined when anonymous
```

Failures are `WorkosAuthError` with a `status` (401, 500 or 502): map it to your
framework's HTTP error. With `@microphi/endpoint`:

```ts
try { return await auth.requireUser(authorization); }
catch (e) { throw e instanceof WorkosAuthError ? new HttpError(e.status, e.message, undefined, { cause: e }) : e; }
```

`requireIdentity` reads an `email` claim when a WorkOS JWT template adds one;
otherwise it asks the WorkOS users API (with `apiKey`) once per user per process.

## Angular

```ts
// app.config.ts
providers: [
  provideHttpClient(withInterceptors([authKitInterceptor])),
  provideAuthKit(),   // { configUrl: '/api/config', callbackPath: '/callback', apiPrefix: '/api/', devMode: true }
  provideRouter([
    { path: 'callback', canActivate: [authKitCallback], children: [] },
    { path: 'admin', canActivate: [signedIn], loadComponent: ... },
  ]),
]
```

```ts
readonly auth = inject(AuthKit);
// auth.user(), auth.signedIn(), auth.available(), auth.signIn(returnTo?), auth.signOut(), auth.accessToken()
```

At startup `AuthKit` reads `{ workosClientId }` from `configUrl`: your API
serves the client id, so one build runs anywhere. No client id: the app runs
signed out. The token goes only to relative `apiPrefix` URLs.

No Angular compiler involved: `AuthKit` is provided by a factory, the guards
and the interceptor are functions, and the callback is a guard, not a component.

## Testing and local dev

```ts
import { TestIssuer } from '@microphi/workos/testing';

const issuer = await TestIssuer.create({ apiKey: 'sk_test' });
issuer.users.set('user_carol', 'carol@example.com');   // for tokens without an email claim
// serve issuer.fetch (a Fetch handler) and point the verifier at it:
new WorkosVerifier({ clientId: 'test', jwksUrl: `${base}/jwks`, apiUrl: base, apiKey: 'sk_test' });
const token = await issuer.token('user_alice', { email: 'alice@example.com', expiresIn: '5m' });
```

To run the app signed in as anyone, without WorkOS: have the dev server mount
the issuer and answer the config with `fake`:

```json
{ "workosClientId": "fake", "fake": { "tokenUrl": "/api/dev/auth/token", "users": [{ "id": "user_alice", "email": "alice@example.com", "firstName": "Alice" }] } }
```

`AuthKit` then loads `fakeAuthKit` instead of the real client (a lazy chunk):
signing in prompts for a user, and tokens come from the issuer, so the API
verifies them as it would WorkOS's. Switch user from a script by writing
`{ id, email }` to `localStorage['fake-authkit-user']` and reloading. Never
serve `fake` from production.
