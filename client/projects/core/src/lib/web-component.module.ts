import { Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { Router } from '@angular/router';

export abstract class PhiModule {

  protected abstract component:  any;
  protected abstract tag: string;
  private _injector: any;

  // TODO add type
  protected constructor(private inj: Injector) {

    console.log('constructing module', this.constructor.name);

    document.addEventListener('portal:injector', (ev) => {
      console.log('got portal injector', ev['injector']);
      this._injector = ev['injector'];
    });

    document.dispatchEvent(new Event('portal:get:injector'))

  }

  ngDoBootstrap(){
    console.log('portal injector is available?', this._injector);

    // const portalRouter = this._injector.get(Router);
    //
    // const augmentedInjector = Injector.create({
    //   providers: [
    //     portalRouter
    //   ],
    //   parent: this._injector
    // });


    const el = createCustomElement(this.component, {injector: this.inj});
    console.log('creating customElement', el);

    customElements.define(this.tag, el as Function);
  }

}
