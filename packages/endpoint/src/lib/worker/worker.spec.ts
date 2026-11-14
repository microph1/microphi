import { Injectable, TestBed } from '@microphi/di';
import { z } from 'zod';
import { Endpoint } from '../endpoint/endpoint.decorator';
import { HttpError } from '../errors';
import { LambdaDefaultHandler } from '../lambda/handler';
import { Lambda } from '../lambda/lambda.decorator';
import { Body, Header, Path } from '../parameters/parameters.decorator';
import { Serverless } from '../serverless/serverless.decorator';
import { bootstrap } from '../bootstrap/bootstrap';
import { WorkerEventHandler } from './worker-event.handler';
import { worker, WorkerApp } from './worker';

const Speaker = z.object({ name: z.string() });

@Endpoint({ name: 'speakers', basePath: '/api' })
@Injectable()
class SpeakersEndpoint {

  @Lambda({ method: 'GET', path: '/speakers/{id}' })
  public findOne(@Path('id') id: string, @Header('authorization') authorization: string) {
    if (id === 'missing') {
      throw new HttpError(404, `speaker ${id} not found`);
    }
    if (id === 'broken') {
      throw new Error('database down');
    }
    return { id, authorization };
  }

  @Lambda({ method: 'GET', path: '/speakers/me' })
  public me() {
    return { id: 'me' };
  }

  @Lambda({ method: 'PUT', path: '/speakers/{id}' })
  public update(@Path('id', z.coerce.number()) id: number, @Body(Speaker) speaker: z.infer<typeof Speaker>) {
    return { id, ...speaker };
  }

  @Lambda({ method: 'DELETE', path: '/speakers/{id}' })
  public remove(@Path('id') _id: string) {
    return undefined;
  }

  @Lambda({ method: 'GET', path: '/files/{path+}' })
  public file(@Path('path') path: string) {
    return new Response(path, { headers: { 'content-type': 'text/plain' } });
  }
}

@Serverless({
  service: SpeakersEndpoint,
  providers: [{ provide: LambdaDefaultHandler, useClass: WorkerEventHandler }],
})
class App {}

const base = 'https://speakerlab.test';

describe('worker', () => {

  let app: WorkerApp;

  beforeAll(() => {
    app = worker(App);
  });

  const json = (method: string, path: string, body: string) => new Request(`${base}${path}`, {
    method,
    body,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

  it('should call the matching @Lambda with decoded path params and lowercase headers', async () => {
    const res = await app.fetch(new Request(`${base}/api/speakers/a%20b`, { headers: { Authorization: 'Bearer t' } }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 'a b', authorization: 'Bearer t' });
  });

  it('should prefer literal segments over parameters', async () => {
    const res = await app.fetch(new Request(`${base}/api/speakers/me/`));

    expect(await res.json()).toEqual({ id: 'me' });
  });

  it('should match greedy parameters and pass a returned Response through', async () => {
    const res = await app.fetch(new Request(`${base}/api/files/a/b.txt`));

    expect(res.headers.get('content-type')).toBe('text/plain');
    expect(await res.text()).toBe('a/b.txt');
  });

  it('should parse the JSON body and validate it', async () => {
    const res = await app.fetch(json('PUT', '/api/speakers/42', '{"name":"woofer"}'));

    expect(await res.json()).toEqual({ id: 42, name: 'woofer' });
  });

  it('should answer 400 with the issues when validation fails', async () => {
    const res = await app.fetch(json('PUT', '/api/speakers/abc', '{"name":1}'));

    expect(res.status).toBe(400);
    const { message, details } = await res.json() as { message: string; details: unknown[] };
    expect(message).toMatch(/^Invalid request: id: .+; body\.name: .+/);
    expect(details).toHaveLength(2);
  });

  it('should answer 400 to invalid JSON', async () => {
    const res = await app.fetch(json('PUT', '/api/speakers/42', '{'));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: 'Invalid JSON body' });
  });

  it('should answer 400 to a malformed path parameter', async () => {
    const res = await app.fetch(new Request(`${base}/api/speakers/%E0%A4%A`));

    expect(res.status).toBe(400);
  });

  it('should answer 204 when the method returns undefined', async () => {
    const res = await app.fetch(new Request(`${base}/api/speakers/1`, { method: 'DELETE' }));

    expect(res.status).toBe(204);
    expect(res.body).toBeNull();
  });

  it('should answer with the HttpError status', async () => {
    const res = await app.fetch(new Request(`${base}/api/speakers/missing`));

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ message: 'speaker missing not found' });
  });

  it('should answer 500 to other errors and log them', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const res = await app.fetch(new Request(`${base}/api/speakers/broken`));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ message: 'database down' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should answer 404 when no path matches', async () => {
    const res = await app.fetch(new Request(`${base}/speakers/1`));

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ message: 'No route for GET /speakers/1' });
  });

  it('should answer 405 with Allow when only the method differs', async () => {
    const res = await app.fetch(new Request(`${base}/api/speakers/1`, { method: 'PATCH' }));

    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('GET, PUT, DELETE');
  });

  it('should return undefined from route when nothing matches', async () => {
    expect(app.route(new Request(`${base}/assets/logo.svg`))).toBeUndefined();
    expect(app.route(new Request(`${base}/api/speakers/1`, { method: 'PATCH' }))).toBeUndefined();
    expect((await app.route(new Request(`${base}/api/speakers/me`)))?.status).toBe(200);
  });

  it('should refuse an app that does not provide WorkerEventHandler', () => {
    @Serverless({ service: SpeakersEndpoint, providers: [LambdaDefaultHandler] })
    class LambdaApp {}

    // empty the global container, which still holds the WorkerEventHandler instance
    TestBed.configure({ providers: [] });

    expect(() => worker(LambdaApp)).toThrow(/WorkerEventHandler/);
  });
});

describe('worker with several services', () => {

  @Endpoint({ name: 'projects', basePath: '/api' })
  @Injectable()
  class ProjectsEndpoint {

    @Lambda({ method: 'GET', path: '/projects/{id}' })
    public findOne(@Path('id') id: string) {
      return { project: id };
    }

    @Lambda({ method: 'POST', path: '/speakers/{key}' })
    public attach(@Path('key') key: string) {
      return { attached: key };
    }
  }

  @Serverless({
    service: [SpeakersEndpoint, ProjectsEndpoint],
    providers: [{ provide: LambdaDefaultHandler, useClass: WorkerEventHandler }],
  })
  class MultiApp {}

  let app: WorkerApp;

  beforeAll(() => {
    TestBed.configure({ providers: [] });
    app = worker(MultiApp);
  });

  it('should route to every service', async () => {
    expect(await (await app.fetch(new Request(`${base}/api/projects/7`))).json()).toEqual({ project: '7' });
    expect(await (await app.fetch(new Request(`${base}/api/speakers/me`))).json()).toEqual({ id: 'me' });
    expect(await (await app.fetch(new Request(`${base}/api/speakers/3`, { method: 'POST' }))).json()).toEqual({ attached: '3' });
  });

  it('should merge Allow across services', async () => {
    const res = await app.fetch(new Request(`${base}/api/speakers/3`, { method: 'PATCH' }));

    expect(res.headers.get('allow')).toBe('GET, PUT, DELETE, POST');
  });

  it('should bootstrap to the first service', () => {
    TestBed.configure({ providers: [] });
    expect(bootstrap(MultiApp)).toBeInstanceOf(SpeakersEndpoint);
  });

  it('should refuse two lambdas answering the same method and path', () => {
    @Endpoint({ name: 'clash' })
    @Injectable()
    class ClashEndpoint {
      @Lambda({ method: 'GET', path: '/api/speakers/{other}' })
      public clash() {
        return undefined;
      }
    }

    @Serverless({
      service: [SpeakersEndpoint, ClashEndpoint],
      providers: [{ provide: LambdaDefaultHandler, useClass: WorkerEventHandler }],
    })
    class ClashApp {}

    TestBed.configure({ providers: [] });
    expect(() => worker(ClashApp)).toThrow('GET /api/speakers/{other} is served by both speakers.findOne and clash.clash');
  });
});
