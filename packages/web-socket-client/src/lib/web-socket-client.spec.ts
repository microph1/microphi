import WS from 'jest-websocket-mock';
import { WebSocketClient } from './web-socket-client';


Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => 'randomUUID',
  }
});

describe('WebSocketClient', () => {

  /**
    # @microphi/web-socket-client

    A simple wrapper around the native WebSocketClient that handles reconnection and optionally a ping to check the server's status (needs server side implementation).

  */

  let client: WebSocketClient;
  let server: WS;

  beforeAll(async () => {

    // create a WS instance, listening on port 1234 on localhost
    server = new WS('ws://localhost:1234');
  });


  afterAll(() => {
    server.close();
  });

  describe('auto connect', () => {

    beforeEach(() => {
      client = new WebSocketClient({
        url: 'ws://localhost:1234',
        autoConnect: true,
      });

    });

    it('should create', () => {

      expect(client).toBeTruthy();

    });


    it('should auto connect', async () => {

      await server.connected;

      expect(client.status).toEqual('connected');

    });
  });





});

