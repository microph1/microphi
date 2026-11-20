// @vitest-environment jsdom
import { decodeJwt } from 'jose';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { fakeAuthKit, fakeUserId } from './fake-authkit.js';
import { TestIssuer } from './issuer.js';

describe('fakeAuthKit', () => {
  let assign: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const issuer = await TestIssuer.create();
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => issuer.fetch(new Request(new URL(String(input), 'http://localhost'), init)));
    assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, pathname: '/', href: 'http://localhost/', origin: 'http://localhost', assign });
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => vi.unstubAllGlobals());

  const users = [{ id: 'user_alice', email: 'alice@example.com', firstName: 'Alice' }];

  test('starts signed out; a token needs a user', async () => {
    const client = await fakeAuthKit({ tokenUrl: '/token', users })('fake', {});
    expect(client.getUser()).toBeNull();
    await expect(client.getAccessToken()).rejects.toThrow('signed out');
  });

  test('signs in as a picked user, carries the state to the callback, and hands out their tokens', async () => {
    vi.stubGlobal('prompt', () => 'ALICE@example.com');
    const onRedirectCallback = vi.fn();
    const create = fakeAuthKit({ tokenUrl: '/token', users });
    const options = { redirectUri: 'http://localhost/callback', onRedirectCallback };

    await (await create('fake', options)).signIn({ state: { returnTo: '/x' } });
    expect(assign).toHaveBeenCalledWith('http://localhost/callback');
    expect(onRedirectCallback).not.toHaveBeenCalled();

    // the reload, on the callback URL
    vi.stubGlobal('location', { ...location, pathname: '/callback' });
    const client = await create('fake', options);
    expect(onRedirectCallback).toHaveBeenCalledWith({ state: { returnTo: '/x' } });
    expect(client.getUser()).toEqual(users[0]);
    expect(decodeJwt(await client.getAccessToken())).toMatchObject({ sub: 'user_alice', email: 'alice@example.com' });

    client.signOut({ returnTo: 'http://localhost' });
    expect(client.getUser()).toBeNull();
  });

  test('anyone can sign in by email when no users are listed; cancelling does nothing', async () => {
    vi.stubGlobal('prompt', () => 'bob@example.com');
    const client = await fakeAuthKit({ tokenUrl: '/token' })('fake', {});
    await client.signIn();
    expect(client.getUser()).toEqual({ id: fakeUserId('bob@example.com'), email: 'bob@example.com' });

    vi.stubGlobal('prompt', () => null);
    localStorage.clear();
    await client.signIn();
    expect(client.getUser()).toBeNull();
  });
});
