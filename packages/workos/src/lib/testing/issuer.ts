import { exportJWK, generateKeyPair, JWK, SignJWT } from 'jose';

type PrivateKey = Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];

export interface TestTokenOptions {
  /** Puts an `email` claim in, as a WorkOS JWT template would. */
  email?: string;
  /** jose time span, e.g. `5m`, or `-1m` for an expired token. Default `1h`. */
  expiresIn?: string;
  claims?: Record<string, unknown>;
}

/**
 * Stands in for WorkOS in tests and in local dev: signs access tokens with its
 * own key and serves what `WorkosVerifier` fetches, so the real verification
 * runs end to end without anyone signing in.
 *
 * `fetch` answers, under any prefix:
 *   GET  …/jwks                      its public key
 *   GET  …/user_management/users/:id  a user in `users` (with `apiKey`, when set)
 *   POST …/token { sub, email? }      a fresh token: what `fakeAuthKit` calls
 */
export class TestIssuer {
  /** WorkOS user id → email, for the users API. */
  readonly users = new Map<string, string>();

  private constructor(private readonly privateKey: PrivateKey, private readonly jwk: JWK, private readonly apiKey?: string) {}

  static async create(options: { apiKey?: string } = {}): Promise<TestIssuer> {
    const { privateKey, publicKey } = await generateKeyPair('RS256');
    const jwk = { ...(await exportJWK(publicKey)), kid: 'test', alg: 'RS256', use: 'sig' };
    return new TestIssuer(privateKey, jwk, options.apiKey);
  }

  token(sub: string, { email, expiresIn = '1h', claims = {} }: TestTokenOptions = {}): Promise<string> {
    return new SignJWT({ ...claims, ...(email ? { email } : {}) })
      .setProtectedHeader({ alg: 'RS256', kid: 'test' })
      .setSubject(sub)
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(this.privateKey);
  }

  jwks(): { keys: JWK[] } {
    return { keys: [this.jwk] };
  }

  /** A Fetch handler: mount it anywhere and point `jwksUrl` / `apiUrl` at it. */
  readonly fetch = async (request: Request): Promise<Response> => {
    const path = new URL(request.url).pathname;
    if (request.method === 'GET' && path.endsWith('/jwks')) {
      return Response.json(this.jwks());
    }
    const user = /\/user_management\/users\/([^/]+)$/.exec(path)?.[1];
    if (request.method === 'GET' && user) {
      if (this.apiKey && request.headers.get('authorization') !== `Bearer ${this.apiKey}`) {
        return Response.json({ message: 'Unauthorized' }, { status: 401 });
      }
      const email = this.users.get(decodeURIComponent(user));
      return email ? Response.json({ id: decodeURIComponent(user), email }) : Response.json({ message: 'Not found' }, { status: 404 });
    }
    if (request.method === 'POST' && path.endsWith('/token')) {
      const { sub, email } = await request.json() as { sub?: string; email?: string };
      if (!sub) return Response.json({ message: 'sub is required' }, { status: 400 });
      return Response.json({ accessToken: await this.token(sub, { email }) });
    }
    return Response.json({ message: 'Not found' }, { status: 404 });
  };
}
