import { parseTemplate, registerDirective, registerPipe } from '@flux/core';
import { DI } from '@microgamma/digator';
import { RootComponent } from './components/root.component';
import { FxUserComponent } from './components/fx-user.component';
import { FxMetronomeComponent } from './components/fx-metronome.component';

import './styles.css';


registerPipe('async', (source$) => {

  return `__#${source$}#__`;

});


export function fxIf(node, value) {

  const v = eval(value);

  console.log('running directive on', node, 'with value', {v});
  if (v) {
    node.style.setProperty('display', 'block');
  } else {
    node.style.setProperty('display', 'none');
  }

}

registerDirective('fxif', fxIf);

registerDirective('fxfor', (node, value: string) => {

  console.log('this is fxfor', node, value);

  const parsedInput = value.match(/^let\s(.+)\sof\s(.+)$/);

  const varname = parsedInput[1];
  const items = parsedInput[2].split(',');

  if (node.hasAttribute('fxfor')) {
    (node as HTMLElement).style.setProperty('display', 'none');
  }

  for (const item of items.reverse()) {

    const clone = node.parentNode.querySelector(`[data-fxfor="${item}"]`) || document.createElement(node.tagName);


    // @ts-ignore
    const template = node.childNodes[0].data;
    const interpolated = parseTemplate(template, {
      [varname]: item
    });

    clone.innerHTML = interpolated;
    clone.setAttribute( 'data-fxfor', item);

    node.after(clone);
  }

});


@DI({
  providers: [
    RootComponent,
    FxUserComponent,
    FxMetronomeComponent,
  ]
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class App {}
