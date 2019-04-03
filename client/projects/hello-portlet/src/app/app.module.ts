import { BrowserModule } from '@angular/platform-browser';
import { Injector, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { createCustomElement } from '@angular/elements';
import { ComponentAComponent } from './component-a/component-a.component';
import { BComponent } from './b/b.component';

@NgModule({
  declarations: [
    AppComponent,
    ComponentAComponent,
    BComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  entryComponents: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {}


  ngDoBootstrap(){
    console.log('ngDoBootstrap custom element');
    const el = createCustomElement(AppComponent, {injector: this.injector});

    customElements.define('hello-portlet', el as Function);
  }

}
