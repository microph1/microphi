import { BrowserModule } from '@angular/platform-browser';
import { Injector, NgModule } from '@angular/core';

import { createCustomElement } from '@angular/elements';
import { ProfileComponent } from './profile.component';
import { ProfileRoutingModule } from './profile-routing.module';

@NgModule({
  declarations: [ProfileComponent],
  imports: [
    BrowserModule,
    ProfileRoutingModule
  ],
  providers: [],
  entryComponents: [ProfileComponent]
})
export class ProfileModule {
  constructor(private inj: Injector) {}

  ngDoBootstrap(){

    const el = createCustomElement(ProfileComponent, {injector: this.inj});

    customElements.define('profile-portlet', el as Function);
  }


}
