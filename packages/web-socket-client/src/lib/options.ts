
export interface Options {
    url: string;
    autoConnect?: boolean;
    reconnectTimeout?: number;
    pingInterval?: number;
    protocols?: string | string[];
    stickyUUID?: boolean;
    token?: string;
}

