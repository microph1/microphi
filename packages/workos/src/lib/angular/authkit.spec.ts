// @vitest-environment jsdom
import '@angular/compiler';
import { provideZonelessChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import type { createClient, User } from '@workos-inc/authkit-js';

import { AuthKit, CREATE_AUTHKIT_CLIENT, safeReturnTo } from './authkit.js';
import { authKitCallback, authKitInterceptor, provideAuthKit, signedIn } from './routing.js';

type Options = NonNullable<Parameters<typeof createClient>[1]>;

const alice = { id: 'user_1', email: 'alice@example.com', firstName: 'Alice' } as User;

/** A stand-in for the AuthKit client, recording what the app asked of it. */
function fakeAuthKit(user: User | null) {
  const fake = {
    clientId: undefined as string | undefined,
    options: undefined as Options | undefined,
    token: 'token-1' as string | Error,
    signIn: vi.fn(async () => undefined),
    signOut: vi.fn(),
    getUser: () => user,
    getAccessToken: vi.fn(async () => {
      if (fake.token instanceof Error) throw fake.token;
      return fake.token;
    }),
  };
  const create = vi.fn(async (clientId: string, options: Options) => {
    fake.clientId = clientId;
    fake.options = options;
    return fake;
  });
  return { fake, create };
}


getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
afterEach(() => TestBed.resetTestingModule());

describe('AuthKit', () => {
  let http: HttpTestingController;

  function setup(user: User | null) {
    const authkit = fakeAuthKit(user);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authKitInterceptor])),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthKit, useFactory: () => new AuthKit() },
        { provide: CREATE_AUTHKIT_CLIENT, useValue: authkit.create },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    return { auth: TestBed.inject(AuthKit), ...authkit };
  }

  async function init(auth: AuthKit, config: unknown, status = 200) {
    const done = auth.init();
    const req = http.expectOne('/api/config');
    expect(req.request.headers.has('Authorization')).toBe(false);
    if (status === 200) {
      req.flush(config);
    } else {
      req.flush('down', { status, statusText: 'Error' });
    }
    await done;
  }

  afterEach(() => http.verify());

  it('stays signed out and unavailable without a WorkOS client id', async () => {
    const { auth, create } = setup(null);
    await init(auth, { workosClientId: null });

    expect(create).not.toHaveBeenCalled();
    expect(auth.available()).toBe(false);
    expect(auth.signedIn()).toBe(false);
    expect(await auth.accessToken()).toBeUndefined();
  });

  it('stays signed out when the API is unreachable', async () => {
    const { auth, create } = setup(null);
    await init(auth, null, 502);

    expect(create).not.toHaveBeenCalled();
    expect(auth.available()).toBe(false);
  });

  it('starts AuthKit with the client id, the callback URL and the current session', async () => {
    const { auth, fake } = setup(alice);
    await init(auth, { workosClientId: 'client_123' });

    expect(fake.clientId).toBe('client_123');
    expect(fake.options?.redirectUri).toBe(`${location.origin}/callback`);
    expect(auth.available()).toBe(true);
    expect(auth.user()).toEqual(alice);
  });

  it('remembers where to return after the redirect, same-origin paths only', async () => {
    const { auth, fake } = setup(alice);
    await init(auth, { workosClientId: 'client_123' });

    fake.options?.onRedirectCallback?.({ state: { returnTo: '/tests/42' } } as never);
    expect(auth.returnTo).toBe('/tests/42');

    fake.options?.onRedirectCallback?.({ state: { returnTo: 'https://evil.example' } } as never);
    expect(auth.returnTo).toBe('/');
  });

  it('signs in with the current page as return target, and out', async () => {
    const { auth, fake } = setup(null);
    await init(auth, { workosClientId: 'client_123' });

    await auth.signIn('/tests');
    expect(fake.signIn).toHaveBeenCalledWith({ state: { returnTo: '/tests' } });

    auth.user.set(alice);
    auth.signOut();
    expect(auth.signedIn()).toBe(false);
    expect(fake.signOut).toHaveBeenCalledWith({ returnTo: location.origin });
  });

  it('signs the user out locally when the session can no longer be refreshed', async () => {
    const { auth, fake } = setup(alice);
    await init(auth, { workosClientId: 'client_123' });

    fake.token = new Error('invalid_grant');
    expect(await auth.accessToken()).toBeUndefined();
    expect(auth.signedIn()).toBe(false);
  });

  describe('interceptor', () => {
    it('adds the token to /api calls only when signed in', async () => {
      const { auth } = setup(alice);
      await init(auth, { workosClientId: 'client_123' });
      const client = TestBed.inject(HttpClient);

      const api = firstValueFrom(client.get('/api/tests'));
      // the token is fetched asynchronously before the request goes out
      await Promise.resolve();
      await Promise.resolve();
      const req = http.expectOne('/api/tests');
      expect(req.request.headers.get('Authorization')).toBe('Bearer token-1');
      req.flush([]);
      await api;

      const other = firstValueFrom(client.get('https://example.com/api/x'));
      const external = http.expectOne('https://example.com/api/x');
      expect(external.request.headers.has('Authorization')).toBe(false);
      external.flush({});
      await other;
    });

    it('sends /api calls without a token when signed out', async () => {
      const { auth } = setup(null);
      await init(auth, { workosClientId: 'client_123' });

      const api = firstValueFrom(TestBed.inject(HttpClient).get('/api/tests'));
      await Promise.resolve();
      const req = http.expectOne('/api/tests');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush([]);
      await api;
    });
  });
});

describe('safeReturnTo', () => {
  it('accepts same-origin paths and rejects everything else', () => {
    expect(safeReturnTo('/tests?q=1')).toBe('/tests?q=1');
    for (const bad of ['https://evil.example', '//evil.example', 'javascript:alert(1)', '/callback?code=x', 42, undefined]) {
      expect(safeReturnTo(bad)).toBe('/');
    }
  });
});

describe('routing', () => {
  const state = { url: '/tests/1' } as RouterStateSnapshot;
  const route = {} as ActivatedRouteSnapshot;

  function setup(signedInAs: User | null, available = true) {
    const auth = { signedIn: () => signedInAs !== null, available: () => available, signIn: vi.fn(async () => undefined), returnTo: '/tests/9?x=1' };
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), provideRouter([]), { provide: AuthKit, useValue: auth }] });
    return auth;
  }

  it('signedIn lets a user through and sends anyone else to sign in, back to where they were going', () => {
    setup(alice);
    expect(TestBed.runInInjectionContext(() => signedIn(route, state))).toBe(true);

    TestBed.resetTestingModule();
    const auth = setup(null);
    expect(TestBed.runInInjectionContext(() => signedIn(route, state))).toBe(false);
    expect(auth.signIn).toHaveBeenCalledWith('/tests/1');
  });

  it('signedIn only refuses when sign-in is not configured', () => {
    const auth = setup(null, false);
    expect(TestBed.runInInjectionContext(() => signedIn(route, state))).toBe(false);
    expect(auth.signIn).not.toHaveBeenCalled();
  });

  it('authKitCallback moves on to the page the sign-in started from', () => {
    setup(alice);
    const tree = TestBed.runInInjectionContext(() => authKitCallback(route, state)) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(tree)).toBe('/tests/9?x=1');
  });
});

describe('provideAuthKit', () => {
  it('starts the session before the app, from the configured URL', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authKitInterceptor])),
        provideHttpClientTesting(),
        provideAuthKit({ configUrl: '/auth/config', apiPrefix: '/auth/' }),
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/auth/config').flush({ workosClientId: null });
    await Promise.resolve();
    expect(TestBed.inject(AuthKit).available()).toBe(false);
    http.verify();
  });
});
