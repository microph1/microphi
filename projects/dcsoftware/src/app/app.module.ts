import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCardModule, MatDialogConfig, MatDialogModule, MatDividerModule, MatGridListModule, MatIconModule, MatSidenavModule, MatTabsModule, MatToolbarModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HomeComponent } from './components/home/home.component';
import { PhiModule } from '@microphi/phi';
import { ProjectsComponent } from './components/projects/projects.component';
import { HttpClientModule } from '@angular/common/http';
import { ProjectComponent } from './components/project/project.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProjectsComponent,
    ProjectComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatDividerModule,
    MatCardModule,
    MatTabsModule,
    MatGridListModule,
    MatIconModule,
    MatDialogModule,

    PhiModule,
    MatButtonModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
