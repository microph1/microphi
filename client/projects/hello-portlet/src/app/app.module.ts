import { BrowserModule } from '@angular/platform-browser';
import { Injector, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { ComponentAComponent } from './component-a/component-a.component';
import { BComponent } from './b/b.component';
import { PhiModule } from '@microphi/core';
import { Log } from '@microgamma/loggator';

@NgModule({
  declarations: [
    AppComponent,
    ComponentAComponent,
    BComponent
  ],
  imports: [
    BrowserModule,
    // RouterModule
    // AppRoutingModule
  ],
  providers: [
  ],
  entryComponents: [AppComponent]
})
export class AppModule extends PhiModule {

  @Log()
  private $log;

  component = AppComponent;
  tag = 'hello-portlet';

  constructor(private injector: Injector) {
    super(injector);


    document.addEventListener('portlet:update:route', (ev) => {
      // const portalRouter: Router = ev['router'];
      //
      // const config = portalRouter.config;
      //
      // config[2].children = routes;
      //
      // this.$log.d('portal routing configuration', portalRouter);
      //
      //
      // portalRouter.resetConfig(config);
      //
      // this.$log.d('augmented routing configuration', portalRouter);
      // this.router.initialNavigation();

    });
  }


}
