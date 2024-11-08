import { App } from '@microphi/flux';
import mdcAutoInit from '@material/auto-init';
import { MDCRipple } from '@material/ripple';
import { FxFor, FxIf, FxRootComponent, TestComponentSh } from './components/fx-root/fx-root.component';


@App({
  providers: [],
  declarations: [
    FxRootComponent,
    TestComponentSh,
    FxIf,
    FxFor,
    // MdcSliderComponent,
    // MdcHeaderComponent,
    // MdcTextFieldComponent,
    // FxFor,
    // FxContent,
  ]
})
export class FluxApp {

  constructor() {

    console.log('app started');


    mdcAutoInit(document);

    document.querySelectorAll('.mdc-button').forEach((elm) => {
      new MDCRipple(elm);
    });

    document.querySelectorAll('.mdc-icon-button').forEach((elm) => {
      new MDCRipple(elm).unbounded = true;
    })
  }
}
