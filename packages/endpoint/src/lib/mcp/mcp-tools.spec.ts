import { Injectable, TestBed } from '@microphi/di';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { Endpoint } from '../endpoint/endpoint.decorator';
import { HttpError } from '../errors';
import { LambdaDefaultHandler } from '../lambda/handler';
import { Lambda } from '../lambda/lambda.decorator';
import { Body, Header, Path } from '../parameters/parameters.decorator';
import { McpEventHandler } from './mcp-event.handler';
import { getMcpToolDefinitions, mcpTools } from './mcp-tools';

const User = z.object({ name: z.string() });

@Endpoint({ name: 'users' })
@Injectable()
class UsersEndpoint {

  @Lambda({ method: 'GET', path: '/users/{id}', description: 'Find a user by id' })
  public findOne(@Path('id') id: string, @Header('x-tenant') tenant: string) {
    if (id === 'missing') {
      throw new HttpError(404, `user ${id} not found`);
    }
    return { id, tenant };
  }

  @Lambda({ method: 'POST', path: '/users' })
  public create(@Body(User) user: z.infer<typeof User>) {
    return user;
  }
}

describe('MCP', () => {

  beforeEach(() => {
    TestBed.configure({
      providers: [
        UsersEndpoint,
        { provide: LambdaDefaultHandler, useClass: McpEventHandler },
      ],
    });
  });

  it('should describe every @Lambda as a tool', () => {
    expect(getMcpToolDefinitions(UsersEndpoint)).toEqual([
      {
        name: 'users_findOne',
        description: 'Find a user by id (GET /users/{id})',
        inputSchema: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
          additionalProperties: false,
        },
      },
      {
        name: 'users_create',
        description: 'POST /users',
        inputSchema: {
          type: 'object',
          properties: {
            body: {
              type: 'object',
              properties: { name: { type: 'string' } },
              required: ['name'],
            },
          },
          required: ['body'],
          additionalProperties: false,
        },
      },
    ]);
  });

  it('should refuse unknown tools', async () => {
    await expect(mcpTools(UsersEndpoint).call('nope')).rejects.toThrow('Unknown tool "nope". Available tools: users_findOne, users_create');
  });

  it('should require McpEventHandler', async () => {
    TestBed.configure({ providers: [UsersEndpoint] });

    await expect(mcpTools(UsersEndpoint).call('users_findOne', { id: '1' })).rejects.toThrow('useClass: McpEventHandler');
  });

  describe('through the MCP SDK', () => {

    let client: Client;

    beforeEach(async () => {
      const { tools, call } = mcpTools(UsersEndpoint);

      const server = new Server({ name: 'users', version: '1.0.0' }, { capabilities: { tools: {} } });
      server.setRequestHandler(ListToolsRequestSchema, () => ({ tools }));
      server.setRequestHandler(CallToolRequestSchema, (req, extra) => call(req.params.name, req.params.arguments, extra));

      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
      client = new Client({ name: 'test', version: '1.0.0' });

      await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    });

    afterEach(() => client.close());

    it('should list the tools', async () => {
      const { tools } = await client.listTools();
      expect(tools.map(({ name }) => name)).toEqual(['users_findOne', 'users_create']);
    });

    it('should call a tool', async () => {
      const result = await client.callTool({ name: 'users_findOne', arguments: { id: '42' } });

      expect(result.isError).toBeUndefined();
      expect(result.content).toEqual([{ type: 'text', text: '{"id":"42"}' }]);
    });

    it('should return errors as isError results', async () => {
      const result = await client.callTool({ name: 'users_findOne', arguments: { id: 'missing' } });

      expect(result.isError).toBe(true);
      expect(JSON.parse((result.content as { text: string }[])[0].text)).toEqual({ status: 404, message: 'user missing not found' });
    });

    it('should return validation issues', async () => {
      const result = await client.callTool({ name: 'users_create', arguments: { body: { name: 1 } } });

      expect(result.isError).toBe(true);
      const { status, details } = JSON.parse((result.content as { text: string }[])[0].text);
      expect(status).toEqual(400);
      expect(details).toEqual([expect.stringMatching(/^body\.name: /)]);
    });
  });
});
