/** A signed-in user as AuthKit's `getUser()` returns it (the fields apps read). */
export interface FakeUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

/** The subset of AuthKit's `createClient` options the fake honours. */
export interface FakeAuthKitOptions {
  redirectUri?: string;
  onRedirectCallback?: (params: { state: Record<string, unknown> | null }) => void;
}

export interface FakeAuthKitConfig {
  /** Where to POST `{ sub, email }` for a token: a `TestIssuer`'s `/token`. */
  tokenUrl: string;
  /** Who `signIn` offers (by prompt). Default: anyone, by typed email. */
  users?: FakeUser[];
  /** Where the current user is kept. Default `fake-authkit-user`. */
  storageKey?: string;
}

/** A user id for an email: stable, so the same person is the same user across reloads. */
export const fakeUserId = (email: string): string => `user_${email.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;

/**
 * A stand-in for `@workos-inc/authkit-js`'s `createClient`, for local dev and
 * end-to-end runs: signing in picks a user (no WorkOS page), and access tokens
 * come from a `TestIssuer`, so the API verifies them for real.
 *
 * Switch user without the prompt by writing `{ id, email }` to
 * `localStorage[storageKey]` and reloading.
 */
export function fakeAuthKit(config: FakeAuthKitConfig) {
  const key = config.storageKey ?? 'fake-authkit-user';
  const read = (): FakeUser | null => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? 'null') as FakeUser | null;
    } catch {
      return null;
    }
  };

  const pendingKey = `${key}:state`;

  return async (_clientId: string, options: FakeAuthKitOptions = {}) => {
    // Back on the callback URL after signIn: hand over the state it carried, as AuthKit does.
    const pending = sessionStorage.getItem(pendingKey);
    if (pending !== null && (!options.redirectUri || location.pathname === new URL(options.redirectUri, location.href).pathname)) {
      sessionStorage.removeItem(pendingKey);
      options.onRedirectCallback?.({ state: JSON.parse(pending) as Record<string, unknown> | null });
    }

    return {
      getUser: read,

      async getAccessToken(): Promise<string> {
        const user = read();
        if (!user) throw new Error('signed out');
        const res = await fetch(config.tokenUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sub: user.id, email: user.email }),
        });
        if (!res.ok) throw new Error(`fake token endpoint answered ${res.status}`);
        return (await res.json() as { accessToken: string }).accessToken;
      },

      async signIn({ state }: { state?: Record<string, unknown> } = {}): Promise<void> {
        const offered = config.users?.map((u) => u.email).join(', ');
        const email = prompt(offered ? `Sign in as (${offered})` : 'Sign in as (email)', config.users?.[0]?.email ?? '')?.trim();
        if (!email) return;
        const user = config.users?.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? { id: fakeUserId(email), email };
        localStorage.setItem(key, JSON.stringify(user));
        sessionStorage.setItem(pendingKey, JSON.stringify(state ?? null));
        // where AuthKit would come back to; the app moves on from there
        location.assign(options.redirectUri ?? '/');
      },

      signOut({ returnTo }: { returnTo?: string } = {}): void {
        localStorage.removeItem(key);
        location.assign(returnTo ?? '/');
      },
    };
  };
}
