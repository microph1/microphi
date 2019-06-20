import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComponentAComponent } from './component-a/component-a.component';
import { BComponent } from './b/b.component';
import { Log } from '@microgamma/loggator';
import { APP_BASE_HREF } from '@angular/common';


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
  },
  {
    path: '**',
    redirectTo: 'a',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: false,
      useHash: true
    })
  ],
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

}
