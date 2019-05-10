import { Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';

export abstract class PhiModule {

  protected abstract component:  any;
  protected abstract tag: string;

  // TODO add type
  protected constructor(private inj: Injector) {}

  ngDoBootstrap(){
    const el = createCustomElement(this.component, {injector: this.inj});
    console.log('creating customElement', el);

    customElements.define(this.tag, el as Function);
  }

}
