import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

@NgModule({
  imports: [
    RouterModule.forRoot([], {
      initialNavigation: false,
      useHash: true
    })
  ],
  exports: [RouterModule],
  providers: [
    {
      provide: APP_BASE_HREF,
      useValue: '/profile'

    }
  ]
})
export class ProfileRoutingModule {}
