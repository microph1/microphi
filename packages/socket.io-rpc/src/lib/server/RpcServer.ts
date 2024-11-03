/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDebugger } from '@microphi/debug';
import { Server, Socket } from 'socket.io';

export type ServerSide<RpcInterface extends object> = {
  [k in keyof RpcInterface as `on${Capitalize<string & k>}`]: RpcInterface[k];
}

export interface Command<T = unknown> {
  type?: 'message' | 'internal' | 'event';
  message: string;
  payload?: T;
  requestId?: string;
  from?: string;
  to?: string;
}

export interface IMessage<T = unknown> {
  from: string;
  to: string;
  payload: T;
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class RpcServer<T extends object> {
  #d = getDebugger('@microphi:RpcServer');

  /**
   * Map of sockets by uuid
   */
  clients = new Map<string, Socket>();


  constructor(private io: Server) {

    this.#d('initing RpcServer');

    this.io.on('connect', (socket) => {


      this.#d('socket connected', socket.id);
      this.clients.set(socket.id, socket);

      this.io.allSockets().then((sockets) => {
        this.#d('currently handling', sockets.size, 'sockets');
      });

      socket.on('error', (error) => {
        this.#d('socket error');
        console.error(error);
      });

      socket.on('message', (data) => {
        this.#d('on message', data);

        this.onMessage(data, socket);
      });

      socket.on('disconnect', (reason, description) => {
        this.#d('socket disconnected', socket.id, {reason, description});
        this.onClose(socket.id);
      });
    });
  }

  protected sendEvent(socket: Socket, message: string, payload?: unknown) {
    try {

      socket.send({
        message,
        payload,
      });

    } catch (error) {

      console.log('Unable to send to socket. It may be already closed');
      console.error(error);

    }
  }


  onClose(uuid: string) {
    this.#d(`Socket with id: ${uuid} disconnected`);
  }

  private onMessage(data: Command, socket: Socket) {

    // d('messageEvent', e.toString());
    try {

      // we have the following type of messages
      // - the client requires an rpc to this server
      const { type, message, payload, from, to } = data;
      // d('serving', { message, type });
      // d('payload', payload);

      if (type === undefined) { // aka internal aka RPC

        const method = `on${message[0].toUpperCase()}${message.slice(1)}`;

        if (typeof (this as any)[method] === 'function') {

          const response = (this as any)[method](payload, socket);
          console.log('response:', response);
          if (response) {
            socket.send({message, payload: response});
          }

        } else {
          console.warn(`"${method}" is not in "this". Maybe you want to implement it?`);
        }

      } else if (type === 'message') {
        // const {from, to, ..._payload} = payload as IMessage;
        this.#d('from', from, 'to', to, 'payload', payload);
        if (to) {

          const clients = this.clients;

          const client = clients.get(to);
          if (!client) {
            console.warn('Trying to send a message to a client that is not connected anymore', to);
            console.warn('Evicting peer with id', to);
            clients.delete(to);

          } else {
            client.send({
              message,
              payload: {
                from,
                to,
                payload: payload,
              }
            });
          }

        }

      }
    } catch (e) {
      console.error('Error while handling message:', e);
      console.error(e);
    }

  }

  close() {
    this.io.close();
  }

}
