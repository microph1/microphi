/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReplaySubject } from 'rxjs';
import { DefaultEventsMap } from 'socket.io';
import { Socket } from 'socket.io-client';
import { Command } from './RpcServer';
import { getDebugger } from '@microphi/debug';


export type getPayloadingFromMapping<A, C extends keyof A> =
A[C] extends Function ? A[C] extends () => any
? never[] : A[C] extends (args: infer T) => any
? T : never[] : A[C][];

export type getReturnTypeFormMapping<A, C extends keyof A> =
A[C] extends (...args: any[]) => infer O ? O : never;

export type ClientSide<RpcInterface extends object> = {

  [k in keyof RpcInterface  as `on${Capitalize<string & k>}`]: RpcInterface[k] extends (args: any) => infer O  ? (args: O) => void : never;
};

export abstract class RpcClient<T> {
  #d = getDebugger('@microphi:RpcClient');

  get id() {
    return this.io.id;
  }

  connected = new Promise((res) => {
    this.io.on('connect', () => {
      this.connected$.next(true);
      res(true);
    });
  });

  connected$ = new ReplaySubject<boolean>();

  constructor(public io: Socket<DefaultEventsMap>) {
    // console.log('trying to connect to ws server');

    this.io.on('connect', () => {
      this.connected$.next(false);
      this.onConnect(this.id as string);
    });

    this.io.on('connect_error', (err) => {
      this.connected$.next(false);
      this.onError(err);
    });

    this.io.on('disconnect', (reason, description) => {
      this.#d('socket disconnected', {reason, description});
      this.onDisconnect();
      this.connected$.next(false);

    });

    this.io.on('message', (data) => {
      // this.#d('got message from ws', data);
      this.onMessage(data);
    });
  }

  dispatch<K extends keyof T>(message: K, payload: getPayloadingFromMapping<T, K>) {
    // console.log('dispatching event', event, payload);

    this.send({
      message: message as string,
      payload,
    });

  }

  disconnect() {
    this.io.disconnect();
  }

  protected onConnect(uuid: string) {
    this.#d('onConnect: implement or override', uuid);
  }

  private send(command: Command) {
    this.io.send(command);
  }

  public sendEvent(eventName: string, payload: any) {
    this.send({
      message: eventName,
      payload,
    });
  }

  /**
  * Sends a message to the signaling server `to` the given peer id
  *
  * to: id of target peer
  * payload: payload to send
  *
  * NB: type of ICommand sent is `message`
  *
  */
  public sendMessage(to: string, payload: Command) {
    this.send({
      from: this.io.id,
      to,
      message: payload.message,
      payload: payload.payload,
      type: 'message',
    });
  }

  protected onDisconnect() {
    this.#d('onDisconnect: implement or override');
  }

  protected onError(err: Error) {
    this.#d('onError: implement or override', err);
  }

  private onMessage(data: Command): void {
    try {

      const {message, payload} = data;

      if (message === 'message') {
        this.#d('this is a message from', payload);
      } else {

        const method = `on${message[0].toUpperCase()}${message.slice(1)}`;
        if (method in this) {
          // this.#d('invoking', method, 'with', payload);
          // @ts-ignore
          void this[method](payload);
        } else {
          console.warn(`"${method}" is not in "this". Maybe you want to implement it?`);
        }

      }

    } catch (error) {
      console.error(error);
    }
  }
}
