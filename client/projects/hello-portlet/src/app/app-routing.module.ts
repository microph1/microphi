import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes, RoutesRecognized } from '@angular/router';
import { ComponentAComponent } from './component-a/component-a.component';
import { BComponent } from './b/b.component';
import { Log } from '@microgamma/loggator';
import { APP_BASE_HREF, Location } from '@angular/common';
import { filter } from 'rxjs/operators';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'a',
    pathMatch: 'full'
  },
  {
    path: 'a',
    component: ComponentAComponent,
    // outlet: 'portletOutlet'
  },
  {
    path: 'b',
    component: BComponent,
    // outlet: 'portletOutlet'
  }
];

@NgModule({
  imports: [
    // RouterModule.forRoot(routes, {
    //   // enableTracing: true,
    //   initialNavigation: false,
    //   relativeLinkResolution: 'corrected'
    // })
    RouterModule.forChild(routes)

  ],
  exports: [RouterModule],
  providers: [
    {
      provide: Router,
      useClass: class PortletRouter {}
    },
    {
      provide: APP_BASE_HREF,
      useValue: '/hp'

    }
  ]
})
export class AppRoutingModule {


  @Log()
  private $log;



  // constructor(private router: Router, private location: Location) {
    // this.$log.d('running PortletRoutingModule', router.config);



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

  // }
}
