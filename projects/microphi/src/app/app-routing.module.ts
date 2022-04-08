import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { NoAuthGuard } from './gards/auth/no-auth.guard';
import { AuthGuard } from './gards/auth/auth.guard';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NoAuthGuard]
  },
  // {
  //   path: ':project',
  //   component: DemoDirectivesComponent
  // },
  {
    path: 'demo-change-detection',
    loadChildren:  () => import('./components/demo-change-detection/demo-change-detection.module').then(m => m.DemoChangeDetectionModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [
    NoAuthGuard,
    AuthGuard
  ]
})
export class AppRoutingModule {}
