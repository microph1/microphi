export function getDataLayer(): any[] {
  window['dataLayer'] = window['dataLayer'] || [];

  return window['dataLayer'];
}
