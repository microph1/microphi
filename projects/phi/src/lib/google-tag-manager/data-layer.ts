/* tslint:disable:no-string-literal */

export function getDataLayer(): any[] {
  window['dataLayer'] = window['dataLayer'] || [];

  return window['dataLayer'];
}
