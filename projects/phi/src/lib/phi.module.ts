import { NgModule } from '@angular/core';
import { PhiComponent } from './phi.component';
import { ParallaxDirective } from './directives/parallax.directive';
import { AnimateTextDirective } from './directives/animate-text.directive';

@NgModule({
  declarations: [PhiComponent, ParallaxDirective, AnimateTextDirective],
  imports: [
  ],
  exports: [PhiComponent, ParallaxDirective]
})
export class PhiModule { }
