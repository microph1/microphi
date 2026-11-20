import { decodeJwt } from 'jose';
import { describe, expect, test } from 'vitest';
import { TestIssuer } from './issuer.js';

const req = (path: string, init?: RequestInit) => new Request(`http://issuer.test/any/prefix${path}`, init);

describe('TestIssuer', () => {
  test('signs tokens with the claims asked for', async () => {
    const issuer = await TestIssuer.create();
    const claims = decodeJwt(await issuer.token('user_1', { email: 'a@x.io', claims: { role: 'admin' } }));
    expect(claims).toMatchObject({ sub: 'user_1', email: 'a@x.io', role: 'admin' });
    expect(claims.exp! - claims.iat!).toBe(3600);
  });

  test('serves its JWKS, users behind the API key, and tokens', async () => {
    const issuer = await TestIssuer.create({ apiKey: 'sk' });
    issuer.users.set('user_1', 'a@x.io');

    expect((await (await issuer.fetch(req('/jwks'))).json()).keys).toEqual([expect.objectContaining({ kid: 'test', alg: 'RS256' })]);

    expect((await issuer.fetch(req('/user_management/users/user_1'))).status).toBe(401);
    const user = await issuer.fetch(req('/user_management/users/user_1', { headers: { authorization: 'Bearer sk' } }));
    expect(await user.json()).toEqual({ id: 'user_1', email: 'a@x.io' });
    expect((await issuer.fetch(req('/user_management/users/nope', { headers: { authorization: 'Bearer sk' } }))).status).toBe(404);

    const minted = await issuer.fetch(req('/token', { method: 'POST', body: JSON.stringify({ sub: 'user_2', email: 'b@x.io' }) }));
    expect(decodeJwt((await minted.json()).accessToken)).toMatchObject({ sub: 'user_2', email: 'b@x.io' });
    expect((await issuer.fetch(req('/token', { method: 'POST', body: '{}' }))).status).toBe(400);
    expect((await issuer.fetch(req('/elsewhere'))).status).toBe(404);
  });

  test('users are open to anyone without an API key', async () => {
    const issuer = await TestIssuer.create();
    issuer.users.set('user_1', 'a@x.io');
    expect((await issuer.fetch(req('/user_management/users/user_1'))).status).toBe(200);
  });
});
