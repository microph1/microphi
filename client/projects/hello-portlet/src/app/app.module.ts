import { BrowserModule } from '@angular/platform-browser';
import { Injector, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { ComponentAComponent } from './component-a/component-a.component';
import { BComponent } from './b/b.component';
import { PhiModule } from '@microphi/core';
import { Log } from '@microgamma/loggator';
import { AppRoutingModule } from './app-routing.module';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

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
  providers: [
  ],
  entryComponents: [AppComponent]
})
export class AppModule extends PhiModule {

  @Log()
  private $log;

  component = AppComponent;
  tag = 'hello-portlet';

  constructor(
      private injector: Injector,
      private router: Router,
      private location: Location) {
    super(injector);


    document.addEventListener('portal:NavigationEnd', (ev) => {
      this.$log.d('performing initial navigation');
      this.router.navigateByUrl(location.path(true));
    });
  }


}
