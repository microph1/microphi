import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { TitleResolver } from './resolvers/title.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { Log } from '@microgamma/loggator';
import { BundleData } from '@microphi/core/lib/bundle-data.interface';
import { PortletContainerComponent } from '@microphi/core';
import { filter, tap } from 'rxjs/operators';


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
    canActivate: [AuthGuard],
    children: [
      {
        path: '**',
        component: PortletContainerComponent,
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
    // enableTracing: true

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

}
