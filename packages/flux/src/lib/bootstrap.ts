import { Instance, Klass, bootstrap as diBootstrap, Injectable } from '@microgamma/digator';

export function bootstrap(app: Klass): Instance {

  return diBootstrap(Injectable()(app));
}
