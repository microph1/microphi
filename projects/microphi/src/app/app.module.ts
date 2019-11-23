import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { AuthStore } from './services/auth/auth.store';
import { AuthService } from './services/auth/auth.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpStatusInterceptor } from './services/http/http-status.interceptor';
import { HttpStatusStore } from './services/http/http-status.store';
import { HomeComponent } from './components/home/home.component';
import { IsLoggedInPipe } from './pipes/is-logged-in.pipe';
import { TicketStore } from './services/tickets/ticket.store';
import { BackendService } from './services/tickets/ticket.service';
import { TicketComponent } from './components/ticket/ticket.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    LoginComponent,
    HomeComponent,

    // pipes
    IsLoggedInPipe,

    TicketComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule
  ],
  providers: [
    AuthStore,
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpStatusInterceptor,
      multi: true
    },
    HttpStatusStore,

    TicketStore,
    BackendService,


  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
