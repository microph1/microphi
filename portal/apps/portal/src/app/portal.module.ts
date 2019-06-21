import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { PortalRoutingModule } from './portal-routing.module';
import { BundleLoaderGuard } from './guards/bundle-loader.guard';
import { ProfileComponent } from './profile/profile.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    // components
    AppComponent,
    ToolbarComponent,
    HomeComponent,
    ProfileComponent

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    PortalRoutingModule
  ],
  providers: [
    // services

    // guards
    BundleLoaderGuard
  ],
  bootstrap: [AppComponent]
})
export class PortalModule {}
