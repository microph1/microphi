import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CardsComponent } from './cards.component';
import { FlexModule } from '@angular/flex-layout';
import { PlayerComponent } from './player/player.component';
import { CardComponent } from './card/card.component';


@NgModule({
  imports: [
    RouterModule.forChild([
      {path: '', component: CardsComponent}
    ]),
    CommonModule,
    FormsModule,
    DragDropModule,
    FlexModule
  ],
  exports: [CardsComponent],
  declarations: [CardsComponent, PlayerComponent, CardComponent],
  providers: []
})
export class CardsModule {
}
