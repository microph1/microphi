import { generateKeyPair, SignJWT } from 'jose';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { TestIssuer } from './testing/issuer.js';
import { WorkosAuthError, WorkosVerifier } from './verifier.js';

const BASE = 'http://workos.test';
let issuer: TestIssuer;

/** Every fetch goes to the issuer: no network. */
beforeAll(async () => {
  issuer = await TestIssuer.create({ apiKey: 'sk_test' });
  issuer.users.set('user_carol', 'Carol@Example.com');
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => issuer.fetch(new Request(input, init)));
});

afterAll(() => vi.unstubAllGlobals());

const verifier = (extra: Partial<ConstructorParameters<typeof WorkosVerifier>[0]> = {}) =>
  new WorkosVerifier({ clientId: 'client_test', jwksUrl: `${BASE}/jwks`, apiUrl: BASE, apiKey: 'sk_test', ...extra });

const bearer = async (sub: string, options?: Parameters<TestIssuer['token']>[1]) => `Bearer ${await issuer.token(sub, options)}`;

async function rejection(promise: Promise<unknown>): Promise<WorkosAuthError> {
  const e = await promise.then(() => undefined, (err: unknown) => err);
  expect(e).toBeInstanceOf(WorkosAuthError);
  return e as WorkosAuthError;
}

describe('WorkosVerifier', () => {
  test('a valid token is its user; no header is anonymous', async () => {
    expect(await verifier().userId(await bearer('user_1'))).toBe('user_1');
    expect(await verifier().userId(undefined)).toBeUndefined();
    expect(await verifier().requireUser(await bearer('user_1'))).toBe('user_1');
  });

  test('anonymous is a 401 where a user is required, with the configured message', async () => {
    expect(await rejection(verifier({ signInMessage: 'Sign in to write' }).requireUser(undefined))).toMatchObject({ status: 401, message: 'Sign in to write' });
    expect((await rejection(verifier().requireIdentity(null))).status).toBe(401);
  });

  test('malformed, forged and expired tokens are 401s', async () => {
    expect((await rejection(verifier().payload('Basic abc'))).message).toMatch(/Bearer/);
    expect((await rejection(verifier().payload('Bearer not-a-jwt'))).status).toBe(401);

    const { privateKey } = await generateKeyPair('RS256');
    const forged = await new SignJWT({}).setProtectedHeader({ alg: 'RS256', kid: 'test' }).setSubject('mallory').setExpirationTime('5m').sign(privateKey);
    expect((await rejection(verifier().payload(`Bearer ${forged}`))).status).toBe(401);
    expect((await rejection(verifier().payload(await bearer('user_1', { expiresIn: '-1m' })))).status).toBe(401);

  });

  test('the identity email comes from the claim, lowercased', async () => {
    expect(await verifier({ apiKey: undefined }).requireIdentity(await bearer('user_a', { email: 'Alice@Example.com' })))
      .toEqual({ id: 'user_a', email: 'alice@example.com' });
  });

  test('without the claim it is looked up once, with the API key', async () => {
    const v = verifier();
    const spy = vi.spyOn(issuer, 'fetch');
    expect(await v.requireIdentity(await bearer('user_carol'))).toEqual({ id: 'user_carol', email: 'carol@example.com' });
    const lookups = () => spy.mock.calls.filter(([req]) => req.url.includes('/user_management/')).length;
    expect(lookups()).toBe(1);
    await v.requireIdentity(await bearer('user_carol'));
    expect(lookups()).toBe(1);
    spy.mockRestore();
  });

  test('a lookup that cannot happen says why', async () => {
    expect(await rejection(verifier({ apiKey: undefined }).requireIdentity(await bearer('user_carol')))).toMatchObject({ status: 500 });
    expect(await rejection(verifier({ apiKey: 'wrong' }).requireIdentity(await bearer('user_carol')))).toMatchObject({ status: 502 });
    expect(await rejection(verifier().requireIdentity(await bearer('user_nobody')))).toMatchObject({ status: 502 });
  });
});
