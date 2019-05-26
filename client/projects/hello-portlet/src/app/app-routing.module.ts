import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { ComponentAComponent } from './component-a/component-a.component';
import { BComponent } from './b/b.component';


export const routes: Routes = [
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
    initialNavigation: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {



  constructor() {

    console.log('setting listener for portal:get:routes');
    document.addEventListener('portal:get:routes', (ev) => {
      console.log('got request to provide routes', routes);

      const routesResponse = new Event('portlet:provide:routes');
      routesResponse['routes'] = routes;

      console.log('firing', routesResponse);
      document.dispatchEvent(routesResponse);
    });

  }
}
