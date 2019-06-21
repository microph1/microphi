import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { BundleLoaderGuard } from './guards/bundle-loader.guard';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth/auth.guard';
import { Log } from '@microgamma/loggator';
import { filter, tap } from 'rxjs/operators';


const helloPortletData = {
  bundleUrl: 'http://192.168.254.2:4000/main.js',
  tag: 'profile-portlet'
};

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    // canActivate: [AuthGuard]
  },
  // {
  //   path: 'login',
  //   component: LoginComponent
  // },
  {
    path: 'hp',
    component: ProfileComponent,
    canActivate: [
      AuthGuard,
      BundleLoaderGuard
    ],
    data: helloPortletData,
    children: [
      {
        path: '**',
        component: ProfileComponent,
        data: helloPortletData
      }
    ]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [
      AuthGuard,
      BundleLoaderGuard
    ],
    data: helloPortletData,
    children: [
      {
        path: '**',
        component: ProfileComponent,
        data: helloPortletData
      }
    ]
  }
];



@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true
  })],
  exports: [RouterModule],
  providers: [
    // guards
    AuthGuard,
    BundleLoaderGuard
  ]
})
export class PortalRoutingModule {

  @Log()
  private $log;

  constructor(private router: Router) {
    this.$log.d('running PortalRoutingModule');
    router.events.pipe(

      filter((ev) => {
        // TODO here we should filter all paths that we know contain a portlet
        return ev instanceof NavigationEnd && ev.urlAfterRedirects.indexOf('hp') > 0
      }),
      tap((ev) => {
        this.$log.d(ev);
      }),
      tap(() => {
        document.dispatchEvent(new Event('portal:NavigationEnd'));
      })
    ).subscribe()

  }

}
