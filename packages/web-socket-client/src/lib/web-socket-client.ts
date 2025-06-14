import { ConnectionStatus } from './connection-status';
import { Options } from './options';


export class WebSocketClient extends EventTarget {

  public uuid!: string;
  public token!: string;

  private _status: ConnectionStatus = 'disconnected';
  private reconnectWhenBackOnline!: boolean;
  private pingTiming!: number;

  public get status(): ConnectionStatus {
    return this._status;
  }

  public set status(value: ConnectionStatus) {
    this._status = value;
    this.dispatchEvent(new CustomEvent<ConnectionStatus>('connectionStatusChange', {detail: value}));
  }

  private ws!: WebSocket;

  private reconnection!: any;
  private pingIntervalTimer!: any;
  private pingResponseTimer!: any;

  constructor(private options: Options) {

    super();

    if (this.options.stickyUUID) {
      // assuming this is working only on the browser for now

      const uuid = localStorage.getItem('__WebSocketClient__uuid__');

      if (uuid) {
        this.uuid = uuid;
      } else {
        this.uuid = crypto.randomUUID();
        localStorage.setItem('__WebSocketClient__uuid__', this.uuid);
      }

    } else {

      this.uuid = crypto.randomUUID();

    }

    this.options.reconnectTimeout = this.options.reconnectTimeout ?? 2_000;
    this.options.pingInterval = this.options.pingInterval ?? 5_000;

    const {url, autoConnect} = this.options;

    if (!url) {
      throw new Error('Url cannot be nullish');
    }

    if (autoConnect) {
      this.connect();
    }

    window.addEventListener('online', () => {
      console.log('system is online');

      if (this.reconnectWhenBackOnline) {
        this.reconnectWhenBackOnline = false;
        this.connect();
      }
    });

    window.addEventListener('offline', () => {
      console.log('system is offline');

      this.ws.close();

      this.reconnectWhenBackOnline = true;
    });
  }

  connect(token?: string) {

    if (token) {
      this.token = token;
    }

    console.log('Starting a WS connection');

    if (!navigator.onLine) {
      console.log('System is offline will try to reconnect when is back online');
      return;
    }

    if (this.ws) {
      // there is already a WebSocket instance
      // let's check its status

      if (!(this.ws.readyState === this.ws.CLOSED)) {
        console.log('There is already a pending WebSocket connection that is not closed yet. Skipping');
        return;
      }

      // clean up previuos listeners
      this.ws.removeEventListener('open', this.onOpen);
      this.ws.removeEventListener('message', this.onMessage);
      this.ws.removeEventListener('close', this.onClose);
      this.ws.removeEventListener('error', this.onError);
    }

    const {url} = this.options;

    const _url = new URL(url);

    _url.searchParams.append('uuid', this.uuid);

    if (this.token) {
      _url.searchParams.append('jwt', this.token);
    }

    this.ws = new WebSocket(_url, this.options.protocols);

    console.log('ws', this.ws);

    this.ws.addEventListener('open', (event) => this.onOpen(event));

    this.ws.addEventListener('close', (event) => this.onClose(event));

    this.ws.addEventListener('message', (event) => this.onMessage(event));

    this.ws.addEventListener('error', (event) => this.onError(event));
  }

  onError(event: Event) {
    console.error('WebSocket error', event);
    this.dispatchEvent(new CustomEvent('error', event));
  }

  onClose(event: CloseEvent) {
    const reconnectTimeout = this.options.reconnectTimeout;

    console.log('connection closed', event, new Date().toISOString());
    this.status = 'disconnected';

    if (event.code === 1000) {
      // do not reconnect if connection is closed by user
      return;
    }

    console.log(`Will try to reconnect in ${reconnectTimeout}ms`);

    this.dispatchEvent(new CustomEvent('close', event));

    if (this.reconnection) {
      clearTimeout(this.reconnection);
    }

    // clear ping timers to avoid unnecessary disconnections
    clearTimeout(this.pingResponseTimer);
    clearTimeout(this.pingIntervalTimer);

    this.reconnection = setTimeout(() => {
      this.connect();
    }, reconnectTimeout);

  }

  onMessage(event: MessageEvent) {

    try {
      const message = JSON.parse(event.data);

      if (message.message === 'ping') {

        this.onPing();

      } else {

        this.dispatchEvent(new CustomEvent('message', {detail: message}));

      }

    } catch (error) {

      console.error('Error parsing message', event.data);
      console.error(error);

    }

  }

  onOpen(event: Event) {

    console.log('connection established', event, new Date().toISOString());

    this.status = 'connected';

    this.dispatchEvent(new CustomEvent('open', event));

    // start pinging the server to monitor connection

    if (this.pingIntervalTimer) {
      clearInterval(this.pingIntervalTimer);
    }

    if (this.reconnection) {
      clearTimeout(this.reconnection);
    }

    this.pingIntervalTimer = setInterval(() => {
      this.pingTiming = Date.now();
      this.send({message: 'ping'});
      this.pingResponseTimer = setTimeout(() => {

        //console.log('Lost ping... Closing connection');
        // if we don't get response from ping in pingInterval assume we lost connection
        this.ws.close(3001, 'Ping Timeout');

      }, this.options.pingInterval);

    }, this.options.pingInterval);

  }

  send(message: unknown) {

    try {

      // TODO need to wait for connection to be enstabilished before sending

      this.ws.send(JSON.stringify(message));

    } catch (error) {
      console.error('Error trying to send message', message);
      console.error(error);
    }
  }

  close() {
    this.ws.close(1000, 'Requested By User');
  }

  onPing() {
    const ping = Date.now() - this.pingTiming;

    this.dispatchEvent(new CustomEvent<number>('ping', {detail: ping}));
    clearTimeout(this.pingResponseTimer);
  }
}

