import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import '../lib';
import { MatToolbarModule } from '@angular/material/toolbar';

import * as CanvasJSAngularChart from '../assets/canvasjs.angular.component';
import { MatSliderModule } from '@angular/material/slider';
import { BassReflexComponent } from './bass-reflex/bass-reflex.component';
import { RouterModule } from '@angular/router';
import { ComponentStore, ImportGraphComponent } from './import-graph/import-graph.component';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SvgImportComponent } from './svg-import/svg-import.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { HomeComponent } from './home/home.component';
import { SpeakersComponent } from './speakers/speakers.component';
import { SpeakersToolbarComponent } from './speakers/spearkers-toolbar/speakers-toolbar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { FxDimensionField, SpeakerComponent } from './speakers/speaker/speaker.component';
import { HttpClientModule } from '@angular/common/http';
import { SafeRemoveDirective } from './directives/safe-remove/safe-remove.directive';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgxBodeComponent } from './ngx-bode/ngx-bode.component';

const CanvasJSChart = CanvasJSAngularChart.CanvasJSChart;

@NgModule({
  declarations: [
    AppComponent,
    // ChartjsComponent,
    CanvasJSChart,
    BassReflexComponent,
    ImportGraphComponent,
    SvgImportComponent,
    HomeComponent,
    SpeakersComponent,
    SpeakerComponent,
    SpeakersToolbarComponent,
    SafeRemoveDirective,

    FxDimensionField,
     NgxBodeComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    MatToolbarModule,
    MatSliderModule,
    HttpClientModule,
    RouterModule.forRoot([
      {
        path: '',
        component: HomeComponent
      },

      {
        path: 'speakers',
        component: SpeakersComponent
      },
      {
        path: 'speakers/:id',
        component: SpeakerComponent
      },
      {
        path: 'speakers/new',
        component: SpeakerComponent
      },
      {
        path: 'import',
        component: ImportGraphComponent
      },
      {
        path: 'svg-import',
        component: SvgImportComponent
      },
      {path: 'projects', loadChildren: () => import('./projects/projects.module').then(m => m.ProjectsModule)}
    ]),
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatButtonToggleModule,
    MatIconModule,
    MatRadioModule,
    MatSidenavModule,
    MatDialogModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    FormsModule,
    MatExpansionModule
  ],
  providers: [
    ComponentStore
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
}

export function round(n: number, leading: number = 2) {
  // return Math.trunc(n * Math.pow(10, leading)) / Math.pow(10, leading);
  return n;
}

export function linearDerivation(x1: number, x2: number, y1: number, y2: number, x) {

  const dy = y2 - y1;
  const dx = x2 - x1;
  const y = ((dy / dx) * (x - x1)) + y1;
  return round(y, 3);

}
