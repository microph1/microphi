import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { ComponentAComponent } from './component-a/component-a.component';
import { BComponent } from './b/b.component';


const routes: Routes = [
  {
    path: '',
    component: AppComponent
  },
  {
    path: 'hp/a',
    component: ComponentAComponent
  },
  {
    path: 'hp/b',
    component: BComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor() {}

}
