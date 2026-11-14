import { className, injector, Klass } from '@microphi/di';
import { bootstrap } from '../bootstrap/bootstrap';
import { getEndpointMetadataFromClass } from '../endpoint/endpoint.decorator';
import { LambdaDefaultHandler } from '../lambda/handler/lambda-default.handler';
import { getLambdaMetadataFromClass } from '../lambda/lambda.decorator';
import { getServerlessMetadataFromClass, serviceList } from '../serverless/serverless.decorator';
import { WorkerCall, WorkerEventHandler } from './worker-event.handler';

/** a `@Serverless` app served on Cloudflare Workers */
export interface WorkerApp {
  /** the Worker's fetch handler: unmatched requests get a 404, or a 405 when only the method differs */
  fetch(request: Request, env?: unknown, ctx?: unknown): Promise<Response>;
  /** the response of the matching `@Lambda`, `undefined` when none matches (to fall through to something else) */
  route(request: Request): Promise<Response> | undefined;
}

interface Route {
  method: string;
  /** the full path, for messages */
  path: string;
  pattern: RegExp;
  keys: string[];
  /** `endpoint.method`, for messages */
  service: string;
  name: string;
  handle(call: WorkerCall): Promise<Response>;
}

type Match =
  | { route: Route; values: string[] }
  | { allowed: string[] }
  | undefined;

function normalize(path: string): string {
  const normalized = `/${path}`.replace(/\/{2,}/g, '/').replace(/\/$/, '');
  return normalized || '/';
}

/**
 * `/users/{id}` to a RegExp: `{name}` matches one segment, `{name+}` the
 * rest of the path (API Gateway's greedy parameter)
 */
function compile(path: string): Pick<Route, 'pattern' | 'keys'> {
  const keys: string[] = [];
  const source = normalize(path)
    .replace(/[.*+?^$()|[\]\\]/g, '\\$&')
    .replace(/\{(\w+)(\\\+)?\}/g, (_, key: string, greedy?: string) => {
      keys.push(key);
      return greedy ? '(.+)' : '([^/]+)';
    });

  return { pattern: new RegExp(`^${source}$`), keys };
}

function routesOf(service: Klass): Route[] {
  const metadata = getEndpointMetadataFromClass(service);
  const basePath = metadata?.basePath ?? '';
  const endpoint = injector(service) as Record<string, (call: WorkerCall) => Promise<Response>>;

  return getLambdaMetadataFromClass(service)
    .filter((lambda) => lambda.path !== undefined && lambda.method !== undefined)
    .map((lambda) => ({
      method: String(lambda.method).toUpperCase(),
      name: String(lambda.name),
      path: normalize(`${basePath}/${lambda.path}`),
      // the @Endpoint name: bundlers rename classes (`_b`)
      service: metadata?.name ?? className(service),
      handle: (call: WorkerCall) => endpoint[String(lambda.name)](call),
      ...compile(`${basePath}/${lambda.path}`),
    }));
}

/** one table for every service; throws when two lambdas answer the same method and path */
function routingTable(services: Klass[]): Route[] {
  const routes = services.flatMap(routesOf);
  const seen = new Map<string, Route>();

  for (const route of routes) {
    // param names don't matter: /x/{id} and /x/{key} are the same route
    const key = `${route.method} ${route.pattern.source}`;
    const other = seen.get(key);

    if (other) {
      throw new Error(`${route.method} ${route.path} is served by both ${other.service}.${other.name} and ${route.service}.${route.name}; remove or rename one of them`);
    }

    seen.set(key, route);
  }

  // literal segments win over parameters: /users/me before /users/{id}
  const weight = (route: Route) => route.keys.length + (route.pattern.source.includes('(.+)') ? 100 : 0);
  return routes.sort((a, b) => weight(a) - weight(b));
}

function isJson(request: Request): boolean {
  const type = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  return type === 'application/json' || !!type?.endsWith('+json');
}

function error(status: number, message: string, headers?: HeadersInit): Response {
  return Response.json({ message }, { status, headers });
}

/**
 * Serve a `@Serverless` app on Cloudflare Workers, routing across every
 * service in `@Serverless({ service })` (one class or a list). The app must provide
 * `{ provide: LambdaDefaultHandler, useClass: WorkerEventHandler }`; it is
 * bootstrapped once, here.
 *
 * ```typescript
 * export default worker(App);
 * ```
 *
 * Bindings are not passed to the methods: read them with
 * `import { env } from 'cloudflare:workers'`.
 */
export function worker(app: Klass): WorkerApp {
  bootstrap(app);

  if (!(injector(LambdaDefaultHandler) instanceof WorkerEventHandler)) {
    throw new Error('worker needs the app to provide { provide: LambdaDefaultHandler, useClass: WorkerEventHandler } in @Serverless');
  }

  const routes = routingTable(serviceList(getServerlessMetadataFromClass(app).service));

  function match(request: Request): Match {
    const path = normalize(new URL(request.url).pathname);
    const allowed: string[] = [];

    for (const route of routes) {
      const values = route.pattern.exec(path);

      if (!values) {
        continue;
      }

      if (route.method === request.method || route.method === 'ANY') {
        return { route, values: values.slice(1) };
      }

      allowed.push(route.method);
    }

    return allowed.length ? { allowed } : undefined;
  }

  async function dispatch(route: Route, values: string[], request: Request): Promise<Response> {
    const params: Record<string, string> = {};

    try {
      route.keys.forEach((key, i) => params[key] = decodeURIComponent(values[i]));
    } catch {
      return error(400, 'Malformed path parameter');
    }

    let body: unknown;

    if (isJson(request)) {
      const text = await request.text();

      try {
        body = text ? JSON.parse(text) : undefined;
      } catch {
        return error(400, 'Invalid JSON body');
      }
    }

    return route.handle({ request, params, body });
  }

  return {
    fetch(request) {
      const found = match(request);

      if (!found) {
        return Promise.resolve(error(404, `No route for ${request.method} ${new URL(request.url).pathname}`));
      }

      if ('allowed' in found) {
        const allow = [...new Set(found.allowed)].join(', ');
        return Promise.resolve(error(405, `${request.method} not allowed; use ${allow}`, { allow }));
      }

      return dispatch(found.route, found.values, request);
    },

    route(request) {
      const found = match(request);
      return found && 'route' in found ? dispatch(found.route, found.values, request) : undefined;
    },
  };
}
