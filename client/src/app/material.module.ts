import { NgModule } from '@angular/core';
import { MatButtonModule, MatCardModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatListModule, MatProgressBarModule, MatToolbarModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

const exportables = [
  FlexLayoutModule,
  MatToolbarModule,
  MatGridListModule,
  MatListModule,
  MatCardModule,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatProgressBarModule
];

@NgModule({
  imports: exportables,
  exports: exportables
})
export class MaterialModule{}
