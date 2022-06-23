import Mustache from 'mustache';
import { FxElement } from './fx.element';

/**
 * returns the template string with
 * all original input and outputs replaced.
 * @example: the following template input
 *
 *     <div class="main">
 *       {{name}}
 *       <button (click)="changeName()">Change name</button>
 *     </div>
 *
 * becomes
 *     <div class="main">
 *       ${this.name}
 *       <button (click)="${this.id}.changeName()">Change name</button>
 *     </div>
 *
 * @param template
 * @param component
 */
export function parseTemplate(template: string, component: FxElement) {

  debugger;

  const temp = document.createElement('template');
  temp.innerHTML = template;


  // for now it will be enough to string replace all occurrences of inputs and outputs
  // using Mustache to parse {{values_like_this}}
  return Mustache.render(template, component);
}

