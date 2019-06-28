import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { PortalRoutingModule } from './portal-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { HomeComponent } from './home/home.component';
import { AuthService } from './services/auth/auth.service';
import { FileService } from './services/file/file.service';
import { LoginComponent } from './login/login.component';
import { UserService } from './services/user/user.service';
import { TokenBearerInterceptor } from './services/http/token-bearer.interceptor';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    // components
    AppComponent,
    ToolbarComponent,
    HomeComponent,
    ProfileComponent,
    LoginComponent

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    PortalRoutingModule,
    ReactiveFormsModule
  ],
  providers: [
    // services
    AuthService,
    FileService,
    UserService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenBearerInterceptor,
      multi: true
    },

  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PortalModule {}
