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
import { DataService } from './services/data/data.service';
import { IsLoggedInPipe } from './pipes/is-logged-in.pipe';
import { ParallaxDirective } from './directives/parallax/parallax.directive';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './app.effects';
import { EntityDataModule } from '@ngrx/data';
import { UserEffects } from './user/user.effects';

@NgModule({
  declarations: [
    // components
    AppComponent,
    ToolbarComponent,
    HomeComponent,
    ProfileComponent,
    LoginComponent,

    // pipes
    IsLoggedInPipe,
    ParallaxDirective

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    PortalRoutingModule,
    ReactiveFormsModule,
    // StoreModule.forRoot(reducers, {
    //   metaReducers,
    //   runtimeChecks: {
    //     strictStateImmutability: true,
    //     strictActionImmutability: true
    //   }
    // }),
    // !environment.production ? StoreDevtoolsModule.instrument() : [],
    // EffectsModule.forRoot([AppEffects, UserEffects]),
    // EffectsModule.forFeature([UserEffects]),
    // EntityDataModule
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
    DataService

  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PortalModule {}
