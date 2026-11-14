import { Injectable, TestBed } from '@microphi/di';
import { z } from 'zod';
import { ExpressEventHandler, LambdaDefaultHandler } from '../lambda/handler';
import { Lambda } from '../lambda/lambda.decorator';
import { HttpError } from '../errors';
import { getParameterSchemas, toJsonSchema } from './parameter-schema';
import { Body, Header, Path } from './parameters.decorator';

const User = z.object({ name: z.string().describe('the user name') });

@Injectable()
class UsersEndpoint {

  @Lambda({ method: 'POST', path: '/users/{id}' })
  public update(@Path('id', z.coerce.number()) id: number, @Body(User) user: z.infer<typeof User>, @Header('x-trace') trace: string) {
    return { id, user, trace };
  }
}

describe('parameter schemas', () => {

  let users: UsersEndpoint;
  let res: { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    TestBed.configure({
      providers: [
        UsersEndpoint,
        { provide: LambdaDefaultHandler, useClass: ExpressEventHandler },
      ],
    });

    users = TestBed.inject(UsersEndpoint);

    res = {
      status: vi.fn(() => res),
      json: vi.fn(),
    };
  });

  const call = (params: object, body: unknown) => {
    const update = users.update as unknown as (...args: unknown[]) => Promise<unknown>;
    return update({ params, body, headers: { 'x-trace': 't' } }, res);
  };

  it('should record the schemas by parameter index', () => {
    const schemas = getParameterSchemas(UsersEndpoint.prototype, 'update');

    expect(Object.keys(schemas)).toEqual(['0', '1']);
    expect(schemas[0].name).toEqual('id');
    expect(schemas[1].name).toEqual('body');
  });

  it('should call the method with the schema output', async () => {
    await call({ id: '42' }, { name: 'davide' });

    expect(res.json).toHaveBeenCalledWith({ id: 42, user: { name: 'davide' }, trace: 't' });
  });

  it('should answer 400 with every issue', async () => {
    await call({ id: 'abc' }, { name: 1 });

    expect(res.status).toHaveBeenCalledWith(400);

    const [{ message, details }] = res.json.mock.calls[0];
    expect(message).toMatch(/^\[400\] Invalid request: id: .+; body\.name: .+/);
    expect(details).toHaveLength(2);
  });

  it('should reject with a 400 HttpError through the default handler', async () => {
    TestBed.configure({ providers: [UsersEndpoint, LambdaDefaultHandler] });
    users = TestBed.inject(UsersEndpoint);

    await expect(users.update('abc' as unknown as number, { name: 'x' }, 't')).rejects.toBeInstanceOf(HttpError);
  });

  describe('toJsonSchema', () => {

    it('should convert a Standard JSON Schema', () => {
      expect(toJsonSchema(User)).toEqual({
        type: 'object',
        properties: { name: { type: 'string', description: 'the user name' } },
        required: ['name'],
      });
    });

    it('should return undefined when the library has no converter', () => {
      const schema = { '~standard': { version: 1 as const, vendor: 'x', validate: (value: unknown) => ({ value }) } };
      expect(toJsonSchema(schema)).toBeUndefined();
      expect(toJsonSchema(undefined)).toBeUndefined();
    });

    it('should return undefined when the converter throws', () => {
      const schema = {
        '~standard': {
          version: 1 as const,
          vendor: 'x',
          validate: (value: unknown) => ({ value }),
          jsonSchema: { input: () => { throw new Error('nope'); }, output: () => ({}) },
        },
      };
      expect(toJsonSchema(schema)).toBeUndefined();
    });
  });
});
