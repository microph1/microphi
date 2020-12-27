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
import { HomeComponent } from './components/home/home.component';
import { IsLoggedInPipe } from './pipes/is-logged-in.pipe';
import { TicketStore } from './services/tickets/ticket.store';
import { BackendService } from './services/tickets/ticket.service';
import { TicketComponent } from './components/ticket/ticket.component';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DemoDirectivesComponent } from './components/demo-directives/demo-directives.component';
import { GoogleTagManagerModule, LoginModule, PhiModule } from '@microphi/phi';
import { MarkdownModule } from 'ngx-markdown';
import { HttpStatusInterceptor, HttpStatusStore } from '@microphi/store';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    LoginComponent,
    HomeComponent,

    // pipes
    IsLoggedInPipe,

    TicketComponent,
    DemoDirectivesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule,
    MatSidenavModule,
    PhiModule,

    GoogleTagManagerModule.forRoot({
      enable: environment.production,
      trackId: 'UA-85728222-4',
      trackPageViews: true
    }),
    MarkdownModule.forRoot(),
    LoginModule,
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
