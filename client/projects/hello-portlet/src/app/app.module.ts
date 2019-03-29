import { BrowserModule } from '@angular/platform-browser';
import { Injector, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { createCustomElement, NgElementConstructor } from '@angular/elements';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {

  }


  ngDoBootstrap(){
    const el = createCustomElement(AppComponent, {injector: this.injector});

    customElements.define('app-greeter', el as NgElementConstructor);
  }

}
