import { App } from '@microphi/flux';
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
  }
}
