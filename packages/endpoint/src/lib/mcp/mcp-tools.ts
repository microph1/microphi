import { injector, Klass } from '@microphi/di';
import { getEndpointMetadataFromClass } from '../endpoint/endpoint.decorator';
import { LambdaDefaultHandler } from '../lambda/handler/lambda-default.handler';
import { getLambdaMetadataFromClass, LambdaOptions } from '../lambda/lambda.decorator';
import { getParameterSchemas, toJsonSchema } from '../parameters/parameter-schema';
import { getBodyMetadata, getPathMetadata } from '../parameters/parameters.decorator';
import { McpEventHandler, McpToolExtra, McpToolInput, McpToolResult } from './mcp-event.handler';

/** an entry of the MCP `tools/list` result */
export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, Record<string, unknown>>;
    required: string[];
    additionalProperties: false;
  };
}

export interface McpTools {
  /** answer `tools/list` with these */
  readonly tools: McpToolDefinition[];
  /** answer `tools/call` with this */
  call(name: string, input?: McpToolInput, extra?: McpToolExtra): Promise<McpToolResult>;
}

/** the provided handler, if any */
function handler(): LambdaDefaultHandler | undefined {
  try {
    return injector(LambdaDefaultHandler);
  } catch {
    return undefined;
  }
}

function toolName(endpoint: Klass, lambda: LambdaOptions): string {
  const prefix = getEndpointMetadataFromClass(endpoint)?.name;
  const name = prefix ? `${prefix}_${lambda.name}` : String(lambda.name);
  return name.replace(/[^A-Za-z0-9_.-]/g, '_');
}

function toolDescription(lambda: LambdaOptions): string {
  const route = [lambda.method?.toUpperCase(), lambda.path].filter(Boolean).join(' ');

  if (lambda.description) {
    return route ? `${lambda.description} (${route})` : lambda.description;
  }

  return route || String(lambda.name);
}

function toolDefinition(endpoint: Klass, lambda: LambdaOptions): McpToolDefinition {
  const key = String(lambda.name);
  const prototype = endpoint.prototype;
  const schemas = getParameterSchemas(prototype, key);

  const properties: Record<string, Record<string, unknown>> = {};
  const required: string[] = [];

  for (const [name, index] of Object.entries(getPathMetadata(prototype, key))) {
    properties[name] = toJsonSchema(schemas[index]?.schema) ?? { type: 'string' };
    required.push(name);
  }

  for (const index of Object.values(getBodyMetadata(prototype, key))) {
    properties['body'] = toJsonSchema(schemas[index]?.schema) ?? {};
    required.push('body');
  }

  return {
    name: toolName(endpoint, lambda),
    description: toolDescription(lambda),
    inputSchema: { type: 'object', properties, required, additionalProperties: false },
  };
}

/**
 * MCP tool definitions for every `@Lambda` of an endpoint: `@Path`
 * parameters and `body` become the tool's input properties, described by
 * their schemas when the schema library emits JSON Schema. Headers are not
 * tool input; `McpEventHandler` reads them from the transport.
 */
export function getMcpToolDefinitions(endpoint: Klass): McpToolDefinition[] {
  return getLambdaMetadataFromClass(endpoint).map((lambda) => toolDefinition(endpoint, lambda));
}

/**
 * Serve the `@Lambda` methods of bootstrapped endpoints as MCP tools. The
 * app must provide `{ provide: LambdaDefaultHandler, useClass: McpEventHandler }`.
 *
 * ```typescript
 * const { tools, call } = mcpTools(UsersEndpoint);
 * server.setRequestHandler(ListToolsRequestSchema, () => ({ tools }));
 * server.setRequestHandler(CallToolRequestSchema, (req, extra) => call(req.params.name, req.params.arguments, extra));
 * ```
 */
export function mcpTools(...endpoints: Klass[]): McpTools {
  const routes = new Map<string, { endpoint: Klass; method: string }>();
  const tools: McpToolDefinition[] = [];

  for (const endpoint of endpoints) {
    for (const lambda of getLambdaMetadataFromClass(endpoint)) {
      const tool = toolDefinition(endpoint, lambda);
      routes.set(tool.name, { endpoint, method: String(lambda.name) });
      tools.push(tool);
    }
  }

  return {
    tools,
    async call(name, input = {}, extra = {}) {
      const route = routes.get(name);
      if (!route) {
        throw new Error(`Unknown tool "${name}". Available tools: ${[...routes.keys()].join(', ')}`);
      }

      if (!(handler() instanceof McpEventHandler)) {
        throw new Error('mcpTools needs the app to provide { provide: LambdaDefaultHandler, useClass: McpEventHandler } in @Serverless');
      }

      const instance = injector(route.endpoint) as Record<string, (...args: unknown[]) => Promise<McpToolResult>>;
      return instance[route.method](input, extra);
    },
  };
}
