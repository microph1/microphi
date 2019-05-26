import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { PortletContainerComponent } from './portlet-container/portlet-container.component';
import { TitleResolver } from './resolvers/title.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { Log } from '@microgamma/loggator';
import { BundleData } from '@microphi/core/lib/bundle-data.interface';

const helloPortletData: BundleData = {
  bundleUrl: 'http://192.168.254.2:4200/hello-portlet/main.js',
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
    redirectTo: 'hp/a'
  },
  {
    path: 'hp/:subroute',
    component: PortletContainerComponent,
    data: helloPortletData,
    resolve: {
      title: TitleResolver,
      user: UserResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    TitleResolver,
    UserResolver
  ]
})
export class AppRoutingModule {

  @Log()
  private $log;

  constructor() {

    document.addEventListener('portlet:provide:routes', (ev) => {
      this.$log.d('got routes', ev['routes']);
      RouterModule.forChild(routes);
    });
  }

}
