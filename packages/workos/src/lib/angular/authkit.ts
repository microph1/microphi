import { HttpClient } from '@angular/common/http';
import { computed, inject, InjectionToken, signal } from '@angular/core';
import { createClient, type User } from '@workos-inc/authkit-js';
import { catchError, firstValueFrom, of } from 'rxjs';
import type { FakeUser } from '../testing/fake-authkit.js';

/** What the API serves at `configUrl`: public values only. */
export interface AuthKitPublicConfig {
  workosClientId: string | null;
  /**
   * Local dev only: sign in as made-up users, with tokens from a `TestIssuer`
   * at `tokenUrl`, instead of WorkOS. The real client is never loaded then.
   */
  fake?: { tokenUrl: string; users?: FakeUser[] } | null;
}

export interface AuthKitOptions {
  /** Default `/api/config`. */
  configUrl: string;
  /** Where AuthKit sends the browser back; route it to `authKitCallback`. Default `/callback`. */
  callbackPath: string;
  /** Requests under it get the access token; nothing else does. Default `/api/`. */
  apiPrefix: string;
  /**
   * Keep the refresh token in localStorage. Needed without a WorkOS custom
   * auth domain, the only way to get the HttpOnly-cookie session. Default true.
   */
  devMode: boolean;
}

export const AUTHKIT_OPTIONS = new InjectionToken<AuthKitOptions>('AuthKitOptions', {
  providedIn: 'root',
  factory: () => ({ configUrl: '/api/config', callbackPath: '/callback', apiPrefix: '/api/', devMode: true }),
});

type AuthKitClient = Awaited<ReturnType<typeof createClient>>;

/** How the AuthKit client is made; tests provide a fake. */
export const CREATE_AUTHKIT_CLIENT = new InjectionToken<typeof createClient>('createAuthKitClient', {
  providedIn: 'root',
  factory: () => createClient,
});

/**
 * Sign-in through WorkOS AuthKit, entirely in the browser (PKCE): no server
 * session, the API only verifies the access tokens this hands out.
 *
 * Inert when the API has no WorkOS client id: the app runs signed out.
 * Provided by `provideAuthKit()`; `inject(AuthKit)` anywhere.
 */
export class AuthKit {
  private readonly http = inject(HttpClient);
  private readonly create = inject(CREATE_AUTHKIT_CLIENT);
  private readonly options = inject(AUTHKIT_OPTIONS);
  private client?: AuthKitClient;

  /** The signed-in user, or null. */
  readonly user = signal<User | null>(null);
  readonly signedIn = computed(() => this.user() !== null);
  /** Whether sign-in is possible here at all. */
  readonly available = signal(false);

  /** Where to go after the callback; set by AuthKit's redirect callback. */
  returnTo = '/';

  /**
   * Runs once at startup (an app initializer). On the callback URL, AuthKit
   * exchanges the code for tokens while creating the client.
   */
  async init(): Promise<void> {
    const config = await firstValueFrom(
      this.http.get<AuthKitPublicConfig>(this.options.configUrl).pipe(catchError(() => of(null))),
    );
    if (!config?.workosClientId) {
      return;
    }

    const create = config.fake
      ? (await import('../testing/fake-authkit.js')).fakeAuthKit(config.fake) as unknown as typeof createClient
      : this.create;

    try {
      this.client = await create(config.workosClientId, {
        redirectUri: `${location.origin}${this.options.callbackPath}`,
        devMode: this.options.devMode,
        onRedirectCallback: ({ state }) => {
          this.returnTo = safeReturnTo(state?.['returnTo'], this.options.callbackPath);
        },
        onRefreshFailure: () => this.user.set(null),
      });
    } catch (e) {
      console.error('WorkOS AuthKit failed to start; continuing signed out', e);
      return;
    }

    this.available.set(true);
    this.user.set(this.client.getUser());
  }

  /** Off to the WorkOS sign-in page; comes back to `returnTo` (default: the current page). */
  signIn(returnTo = location.pathname + location.search): Promise<void> {
    return this.client?.signIn({ state: { returnTo } }) ?? Promise.resolve();
  }

  signOut(): void {
    this.user.set(null);
    this.client?.signOut({ returnTo: location.origin });
  }

  /** A fresh access token for the API, or undefined when signed out. */
  async accessToken(): Promise<string | undefined> {
    if (!this.client || !this.user()) {
      return undefined;
    }
    try {
      return await this.client.getAccessToken();
    } catch {
      // The session is gone (refresh token revoked or expired).
      this.user.set(null);
      return undefined;
    }
  }
}

/**
 * `state` comes back through the URL unprotected: only accept a same-origin
 * path, so a crafted link can't redirect off-site after sign-in.
 */
export function safeReturnTo(value: unknown, callbackPath = '/callback'): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.startsWith(callbackPath)) {
    return '/';
  }
  return value;
}
