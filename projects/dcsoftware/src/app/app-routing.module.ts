import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProjectComponent } from './components/project/project.component';


const routes: Routes = [{
  path: '',
  component: HomeComponent
}, {
  path: 'project/:id',
  component: ProjectComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
