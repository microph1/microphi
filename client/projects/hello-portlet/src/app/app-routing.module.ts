import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { ComponentAComponent } from './component-a/component-a.component';
import { BComponent } from './b/b.component';
import { Log } from '@microgamma/loggator';
import { APP_BASE_HREF, Location } from '@angular/common';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'a',
    pathMatch: 'full'
  },
  {
    path: 'a',
    component: ComponentAComponent
  },
  {
    path: 'b',
    component: BComponent
  },
  {
    path: '**',
    redirectTo: 'a',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // enableTracing: true,
    initialNavigation: false
  })],
  exports: [RouterModule],
  providers: [
    {
      provide: APP_BASE_HREF,
      useValue: '/hp'

    }
  ]
})
export class AppRoutingModule {


  @Log()
  private $log;

  constructor(private route: Router, private location: Location) {


    document.addEventListener('portlet:update:route', (ev) => {
      this.$log.d('setting up initial navigation');
      this.route.initialNavigation();

    });

    // console.log('setting listener for portal:get:routes');
    // document.addEventListener('portal:get:routes', (ev) => {
    //   console.log('got request to provide routes', routes);
    //
    //   const routesResponse = new Event('portlet:provide:routes');
    //   routesResponse['routes'] = routes;
    //
    //   console.log('firing', routesResponse);
    //   document.dispatchEvent(routesResponse);
    // });

  }
}
