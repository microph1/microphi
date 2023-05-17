import { App, getDirectives, parseTemplate, registerDirective, registerPipe } from '@flux/core';
import { bootstrap, injector } from '@microgamma/digator';
import { FxRootComponent } from './components/fx-root.component';
import { FxUserComponent } from './components/fx-user.component';
import { FxAccordionComponent } from './components/fx-accordion.component';
import { FxIfDirective } from './directives/fx-if.directive';
import './styles.scss';
import { Class } from 'utility-types';

registerPipe('async', (source$) => {

  return `__#${source$}#__`;

});

export function fxIf(node, value) {

  const v = eval(value);

  // console.log('running directive on', node, 'with value', {v});
  if (v) {
    node.style.setProperty('display', 'block');
  } else {
    node.style.setProperty('display', 'none');
  }

}

registerDirective('fxif', fxIf);

registerDirective('fxfor', (node, value: string) => {

  // console.log('this is fxfor', node, value);

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


@App({
  providers: [
    FxIfDirective,
    FxAccordionComponent,
    FxUserComponent,
    FxRootComponent,
  ],
  declarations: [
    FxIfDirective,
    FxAccordionComponent,
    FxUserComponent,
    FxRootComponent,
  ]
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MyApp {
  constructor() {
    const directives = getDirectives();
    console.log('directives', directives);
    Object.entries(directives).forEach(([selector, klass]) => {
      console.log({selector, klass});
      const instance = injector(klass as Class<any>);
      console.log(instance);
    });
  }
}

console.log('everything should be ready now we can start rendering thing');
const app = bootstrap(MyApp);
console.log({app});
