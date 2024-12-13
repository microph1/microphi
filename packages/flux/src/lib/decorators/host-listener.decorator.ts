
import 'reflect-metadata';
import { Class } from 'utility-types';
import { scanInstance } from '../utilities/scan-instance';

export const HostListenerSymbol = Symbol('@HostListener');

export interface HostListener {
  action: string;
}

// Add more when needed
export type Events = 'click';

export interface HostListenerMetadata {
  event: string;
  handler: string;
}

export function HostListener(event: Events): MethodDecorator {
  return (target, propertyKey) => {

    return Reflect.defineMetadata(HostListenerSymbol, {event, handler: propertyKey}, target, propertyKey);
  };
}

export function getHostListenerMetadata(klass: Class<any>, key: string) {
  return Reflect.getMetadata(HostListenerSymbol, klass, key);
}

export function getHostListeners(instance: object): HostListenerMetadata[] {

  const events: HostListenerMetadata[] = [];

  scanInstance(instance, (proto, key) => {

    const metadata = getHostListenerMetadata(proto, key);
    if (metadata) {
      events.push(metadata);
    }

  });

  return events;
}
