import { pipes } from './component.decorator';
import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('@flux:render');

export function parseTemplate(template: string, subs: object) {

  let tpl = template;
  const variables = template.match(/\{\{([^}]+)\|?\s?(\w*)}}/g);


  for (const variable of variables) {
    /**
     * here variables is an array of template testing such as
     * ['{{name}}', {{list$ | async}}]
     *
     * we want to extract the key to get its value from subs.
     */
      // eslint-disable-next-line no-useless-escape
    const matches = variable.match(/\{\{([\w\$]+)\s?\|?\s?(\w+)?}}/);
    const key = matches[1];
    const pipe = matches[2];

    let value = subs[key];

    if (key.endsWith('$')) {
      d('rendering an observable');
      value = subs[`${key}$$`];
    }


    if (pipe in pipes) {
      value = pipes[pipe](value)
    }

    tpl = tpl.replace(variable, value);
  }

  return tpl;

}