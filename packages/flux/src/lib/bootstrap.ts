import { Instance, Klass, bootstrap as diBootstrap, Injectable } from '@microphi/di';

export function bootstrap(app: Klass): Instance {

  return diBootstrap(Injectable()(app));
}
