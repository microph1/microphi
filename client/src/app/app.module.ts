import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { UserService } from './services/user/user.service';
import { XApiKeyInterceptor } from './services/http/x-api-key.interceptor';
import { AuthService } from './services/auth/auth.service';
import { TokenBearerInterceptor } from './services/http/token-bearer.interceptor';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ProfileComponent } from './profile/profile.component';
import { MaterialModule } from './material.module';
import { FileService } from './services/file/file.service';
import { PortletContainerModule } from '@microphi/core';
import { BundleLoaderGuard } from './guards/bundle-loader.guard';
import { RouteReuseStrategy, UrlHandlingStrategy } from '@angular/router';
import { PortalUrlHandlingStrategy } from './services/portal-url-handling.strategy';
import { PortalRouteReuseStrategy } from './services/portal-route-reuse.strategy';
import { Location } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    ToolbarComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ServiceWorkerModule.register('/ngsw-worker.js', {enabled: environment.production}),
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    PortletContainerModule

  ],
  providers: [
    UserService,
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: XApiKeyInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenBearerInterceptor,
      multi: true
    },
    AuthGuard,
    BundleLoaderGuard,
    FileService,
    // {
    //   provide: UrlHandlingStrategy,
    //   useClass: PortalUrlHandlingStrategy
    // },
    // {
    //   provide: RouteReuseStrategy,
    //   useClass: PortalRouteReuseStrategy
    // }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(private injector: Injector) {
    // document.addEventListener('portal:get:injector', () => {
    //   const ev = new Event('portal:injector');
    //   ev['injector'] = injector;
    //
    //   document.dispatchEvent(ev);
    //
    // });
  }
}
