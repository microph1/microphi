import { BrowserModule } from '@angular/platform-browser';
import { Injector, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { ComponentAComponent } from './component-a/component-a.component';
import { BComponent } from './b/b.component';
import { AppRoutingModule } from './app-routing.module';
import { PhiModule } from '@microphi/core';

@NgModule({
  declarations: [
    AppComponent,
    ComponentAComponent,
    BComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  entryComponents: [AppComponent]
})
export class AppModule extends PhiModule {
  component = AppComponent;
  tag = 'hello-portlet';

  constructor(private injector: Injector) {
    super(injector);
  }


}
