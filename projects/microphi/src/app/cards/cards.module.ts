import { NgModule } from '@angular/core';
import { CardsComponent } from './gundb.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';


@NgModule({
  imports: [
    RouterModule.forChild([
      {path: '', component: CardsComponent}
    ]),
    CommonModule,
    FormsModule,
    DragDropModule
  ],
  exports: [CardsComponent],
  declarations: [CardsComponent],
  providers: []
})
export class CardsModule {
}
