import { NgModule } from '@angular/core';
import { DemoChangeDetectionStoreComponent } from './demo-change-detection-store.component';
import { DemoChangeDetectionComponent } from './demo-change-detection.component';
import { DemoChangeDetectionImmutablesComponent } from './demo-change-detection-immutables.component';
import { DemoChangeDetectionObservablesComponent } from './demo-change-detection-observables.component';
import { ItemsStore } from './items-store';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ItemComponent } from './item.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DemoChangeDetectionListComponent } from './demo-change-detection-list.component';


@NgModule({
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DemoChangeDetectionComponent,
        children: [
          {
            path: 'immutables',
            component: DemoChangeDetectionImmutablesComponent
          },
          {
            path: 'observables',
            component: DemoChangeDetectionObservablesComponent
          },
          {
            path: 'store',
            component: DemoChangeDetectionStoreComponent
          },
          {
            path: 'list',
            component: DemoChangeDetectionListComponent
          }
        ]
      }

    ]),
    ReactiveFormsModule
  ],
  exports: [RouterModule],
  declarations: [
    DemoChangeDetectionComponent,
    DemoChangeDetectionStoreComponent,
    DemoChangeDetectionImmutablesComponent,
    DemoChangeDetectionObservablesComponent,
    ItemComponent,
    DemoChangeDetectionListComponent,

  ],
  providers: [
    ItemsStore
  ]
})
export class DemoChangeDetectionModule {}
