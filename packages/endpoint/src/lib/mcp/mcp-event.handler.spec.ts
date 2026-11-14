import { McpEventHandler } from './mcp-event.handler';

describe('McpEventHandler', () => {

  const handler = new McpEventHandler();

  it('should read path parameters and body from the tool arguments', () => {
    const input = { id: '1', body: { a: 1 } };

    expect(handler.getPathParams([input, undefined])).toBe(input);
    expect(handler.getBody([input, undefined])).toEqual({ a: 1 });
    expect(handler.getPathParams([undefined, undefined])).toEqual({});
  });

  it('should read headers from the transport', () => {
    expect(handler.getHeaderParams([{}, { requestInfo: { headers: { 'x-a': 'b' } } }])).toEqual({ 'x-a': 'b' });
    expect(handler.getHeaderParams([{}, undefined])).toEqual({});
  });

  it('should return an empty text for undefined results', async () => {
    const result = await handler.runOriginalFunction(() => undefined, {}, []);
    expect(result).toEqual({ content: [{ type: 'text', text: '' }] });
  });
});
