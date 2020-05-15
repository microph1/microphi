import { NgModule } from '@angular/core';
import { ParallaxDirective } from './directives/parallax.directive';
import { AnimateTextDirective } from './directives/animate-text.directive';

@NgModule({
  declarations: [ParallaxDirective, AnimateTextDirective],
  imports: [],
  exports: [ParallaxDirective, AnimateTextDirective]
})
export class PhiModule { }
