import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { TitleResolver } from './resolvers/title.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { Log } from '@microgamma/loggator';
import { BundleData } from '@microphi/core/lib/bundle-data.interface';
import { filter, tap } from 'rxjs/operators';
import { BundleLoaderGuard } from './guards/bundle-loader.guard';
import { ProfileComponent } from './profile/profile.component';


const helloPortletData: BundleData = {
  bundleUrl: 'http://192.168.254.2:4000/main.js',
  tag: 'hello-portlet',
  template: `
        <hello-portlet [title]="title" [user]="user"></hello-portlet>
      `,
  inputs: ['title', 'user']
};

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'hp',
    component: ProfileComponent,
    canActivate: [AuthGuard, BundleLoaderGuard],
    data: helloPortletData,
    children: [
      {
        path: '**',
        component: ProfileComponent,
        data: helloPortletData,
        resolve: {
          title: TitleResolver,
          user: UserResolver
        }
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
    TitleResolver,
    UserResolver
  ]
})
export class AppRoutingModule {

  @Log()
  private $log;

  constructor(private router: Router) {
    this.$log.d('running PortalRoutingModule');
    router.events.pipe(
      tap((ev) => {
        this.$log.d(ev);
      }),
      filter((ev) => {
        // TODO here we should filter all paths that we know contain a portlet
        return ev instanceof NavigationEnd && ev.urlAfterRedirects.indexOf('hp') > 0
      }),
      tap(() => {
        document.dispatchEvent(new Event('portal:NavigationEnd'));
      })
    ).subscribe()

  }

}
