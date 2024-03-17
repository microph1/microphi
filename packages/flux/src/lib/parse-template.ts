import { pipes } from './component.decorator';
import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('@flux:render');

/**
 * Get a property using the dot notation from subs
 * i.e.:
 *
 * const value = getValue({a: {b: 'c'}}, 'a.b.c')
 * // value is 'c'
 *
 * @param key
 * @param subs
 */
export function getValue(key: string, subs: object) {

  return key.includes('.') ? key.split('.').reduce((obj, k) => {

    if (obj === undefined || obj === null) return undefined;

    return obj[k];
  }, subs) : subs[key];

  // TODO experiment using eval() to get value from subs

}


export function parseTemplate(template: string, subs: object) {

  let tpl = String(template);
  const variables = template.match(/\{\{([^}]+)\|?\s?(\w*)}}/g) || [];


  for (const variable of variables) {
    /**
     * here variables is an array of template testing such as
     * ['{{name}}', {{list$ | async}}]
     *
     * we want to extract the key to get its value from subs.
     */
    const matches = variable.match(/\{\{([\w$.]+)\s?\|?\s?(\w+)?}}/);
    const key = matches?.[1] || '';
    const pipe = matches?.[2] || '';

    let value = getValue(key, subs);

    if (key.endsWith('$')) {
      d('rendering an observable');
      value = subs[`${key}$$`];
    }


    if (pipe in pipes) {
      value = pipes[pipe](value);
    }

    tpl = tpl.replace(variable, value);
  }

  return tpl;

}
