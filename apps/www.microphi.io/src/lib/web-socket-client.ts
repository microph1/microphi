import EventEmitter from 'events';


export interface Options {
  /**
   * Web Socket server url
   */
  url: string|URL;
  /**
   * Whether a connection should be initialized when the class is constructed or manually
   */
  autoConnect?: boolean;
  /**
   * Time (in milliseconds) to wait before a new connection attempt is made after a connection failure
   */
  reconnectTimeout?: number;
  /**
   * Ping time interval in milliseconds
   */
  pingInterval?: number;
}

export type ConnectionStatus = 'connected'|'disconnected';

export interface Message<T> {
  name: string;
  payload: T;
}

interface Events {
  open: [Event];
  close: [CloseEvent];
  message: [any];
  error: [Event];
  connectionStatusChangge: [ConnectionStatus];
}


export class WebSocketClient  extends EventEmitter<Events> {
  protected uuid: string;

  private _status: ConnectionStatus = 'disconnected';


  public get status(): ConnectionStatus {
    return this._status;
  }

  public set status(value: ConnectionStatus) {
    this._status = value;
    this.emit('connectionStatusChangge', value);
  }


  private ws!: WebSocket;

  private reconnection!: any;

  constructor(private options: Options) {
    super();

    this.options.reconnectTimeout = this.options.reconnectTimeout ?? 2_000;
    const {url, autoConnect} = this.options;

    if (!url) {
      throw new Error('Url cannot be nullish');
    }

    this.uuid = crypto.randomUUID();

    console.log(this.uuid);

    if (autoConnect) {
      this.connect();
    }
  }

  connect() {
    const {url, reconnectTimeout} = this.options;

    const _url = new URL(url);
    _url.searchParams.append('uuid', this.uuid);

    this.ws = new WebSocket(_url);

    console.log('ws', this.ws);

    this.ws.addEventListener('open', (event) => {
      console.log('connection enstabilished', event, new Date().toISOString());
      this.status = 'connected';

      this.emit('open', event);
    });

    this.ws.addEventListener('close', (event) => {
      console.log('connection closed', event, new Date().toISOString());
      this.status = 'disconnected';

      console.log(`Will try to reconnect in ${reconnectTimeout}ms`);
      this.emit('close', event);

      if (this.reconnection) {
        clearTimeout(this.reconnection);
      }

      this.reconnection = setTimeout(() => {
        this.connect();
      }, reconnectTimeout);

    });

    this.ws.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        this.emit('message', message);
      } catch (error) {
        console.error('Error parsing message', event.data);
        console.log(error);
      }

    });

    this.ws.addEventListener('error', (event) => {
      console.log('WebSocket error', event);

      this.emit('error', event);
    });
  }

  send(message: any) {
    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error trying to serialize', message);
      console.error(error);
    }
  }
}


