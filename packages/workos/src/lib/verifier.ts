import { createRemoteJWKSet, jwtVerify, JWTPayload, JWTVerifyGetKey } from 'jose';

/** A failed check, with the HTTP status it should answer with. */
export class WorkosAuthError extends Error {
  override readonly name = 'WorkosAuthError';

  constructor(readonly status: 401 | 500 | 502, message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export interface WorkosVerifierOptions {
  /** The AuthKit client id: its JWKS is what tokens are checked against. */
  clientId: string;
  /** Default: WorkOS's JWKS for `clientId`. Point it at a `TestIssuer` in tests. */
  jwksUrl?: string;
  /** Only to look users' emails up when tokens have no `email` claim. */
  apiKey?: string;
  /** Default: https://api.workos.com. */
  apiUrl?: string;
  /** What a missing Authorization header says. */
  signInMessage?: string;
}

export interface WorkosIdentity {
  /** The WorkOS user id (`sub`). */
  id: string;
  /** Lowercase. */
  email: string;
}

/**
 * Verifies WorkOS AuthKit access tokens: the signature against the client's
 * JWKS (specific to the client, so a valid signature already means "issued
 * for this app") and the expiry. Framework-free: wrap it in whatever your
 * server injects, and map `WorkosAuthError.status` to its HTTP error.
 */
export class WorkosVerifier {
  private jwks?: JWTVerifyGetKey;
  /** user id → email, for the life of the process (a WorkOS round trip each otherwise). */
  private readonly emails = new Map<string, string>();

  constructor(private readonly options: WorkosVerifierOptions) {}

  /** The verified claims, or undefined for an anonymous request. Throws 401 on a bad token. */
  async payload(authorization: string | undefined | null): Promise<JWTPayload | undefined> {
    if (!authorization) {
      return undefined;
    }

    const [scheme, token] = authorization.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new WorkosAuthError(401, 'Authorization must be "Bearer <WorkOS access token>"');
    }

    // Built on first use, then cached with its keys for the life of the process.
    this.jwks ??= createRemoteJWKSet(new URL(this.options.jwksUrl || `https://api.workos.com/sso/jwks/${this.options.clientId}`));

    try {
      const { payload } = await jwtVerify(token, this.jwks);
      if (!payload.sub) {
        throw new Error('token has no sub');
      }
      return payload;
    } catch (e) {
      throw new WorkosAuthError(401, `Invalid access token: ${(e as Error).message}`, { cause: e });
    }
  }

  /** The caller's user id, or undefined when anonymous. */
  async userId(authorization: string | undefined | null): Promise<string | undefined> {
    return (await this.payload(authorization))?.sub;
  }

  /** The caller's user id; 401 when anonymous. */
  async requireUser(authorization: string | undefined | null): Promise<string> {
    const payload = await this.payload(authorization);
    if (!payload) {
      throw new WorkosAuthError(401, this.options.signInMessage ?? 'Sign in first');
    }
    return payload.sub!;
  }

  /**
   * The caller's id and lowercase email: from the token's `email` claim when
   * a WorkOS JWT template adds one, else from the WorkOS users API (needs
   * `apiKey`), cached per user.
   */
  async requireIdentity(authorization: string | undefined | null): Promise<WorkosIdentity> {
    const payload = await this.payload(authorization);
    if (!payload) {
      throw new WorkosAuthError(401, this.options.signInMessage ?? 'Sign in first');
    }
    const id = payload.sub!;
    const claim = typeof payload['email'] === 'string' ? payload['email'] : undefined;
    const email = (claim ?? this.emails.get(id) ?? await this.lookupEmail(id)).toLowerCase();
    this.emails.set(id, email);
    return { id, email };
  }

  private async lookupEmail(id: string): Promise<string> {
    const { apiKey, apiUrl = 'https://api.workos.com' } = this.options;
    if (!apiKey) {
      throw new WorkosAuthError(500, 'The access token has no email claim and no WorkOS API key is set to look it up');
    }
    const res = await fetch(`${apiUrl}/user_management/users/${encodeURIComponent(id)}`, { headers: { authorization: `Bearer ${apiKey}` } });
    if (!res.ok) {
      throw new WorkosAuthError(502, `WorkOS user lookup failed: ${res.status}`);
    }
    const { email } = await res.json() as { email?: string };
    if (!email) {
      throw new WorkosAuthError(502, `WorkOS user ${id} has no email`);
    }
    return email;
  }
}
