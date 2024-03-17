import { App, parseTemplate, registerDirective } from '@flux/core';
import { FxRootComponent } from './components/fx-root.component';
import { FxMetronomeComponent } from './components/fx-metronome.component';
import './styles.scss';
import { FxHeaderComponent } from './components/fx-header.component';
import { bootstrap } from '@microgamma/digator';
import { FxKnobComponent } from './components/fx-knob.component';
import mdcAutoInit from '@material/auto-init';
import { MDCRipple } from '@material/ripple';
import { FxSliderComponent } from './mdc-components/slider/fx-slider.component';


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

export function fxIfNot(node, value) {
  // console.log('running directive on', node, 'with value', value);

  const v = eval(value);

  if (v) {
    node.style.setProperty('display', 'none');
  } else {
    node.style.setProperty('display', 'block');
  }

}

registerDirective('fxifnot', fxIfNot);

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


@App({
  providers: [
    FxRootComponent,
    FxMetronomeComponent,
    FxHeaderComponent
  ],
  declarations: [
    FxRootComponent,
    FxMetronomeComponent,
    FxHeaderComponent,
    FxKnobComponent,
    FxSliderComponent,
  ]
})
class MyApp {
  constructor() {
    console.log('now init mdc components');
    // mdcAutoInit.register('MDCTopAppBar', MDCTopAppBar);
    mdcAutoInit(document);

    document.querySelectorAll('.mdc-button').forEach((elm) => {
      new MDCRipple(elm);
    });

    document.querySelectorAll('.mdc-icon-button').forEach((elm) => {
      new MDCRipple(elm).unbounded = true;
    })

    // document.querySelectorAll('.mdc-slider').forEach((elm) => {
    //
    //   setTimeout(() => {
    //     // TODO:
    //     /**
    //      * Without the timeout the below doesn't work because this point in the time
    //      * the value attribute on input.mdc-slider__input has not been resolved yet.
    //      * It enough a timeout 0 to have the value attributed resolved (interpolated).
    //      *
    //      * We should have a lifecycle hook at app level that happens after the first
    //      * rendering is done.
    //      *
    //      * P.S: start from where the log "first rendering done" is.
    //      */
    //
    //     console.log('setting up mdc slider now!');
    //     const slider = new MDCSlider(elm);
    //
    //     slider.listen('MDCSlider:change', (e) => {
    //       console.log(e);
    //       e.cancelBubble = true;
    //       elm.dispatchEvent(new CustomEvent('change', e));
    //     });
    //   });
    //
    // });

  }
}

bootstrap(MyApp);
