/* tslint:disable:no-string-literal */
import { Injectable, Optional } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GoogleTagManagerService {
  private dataLayer: any[] =  window['dataLayer'] || [];


  constructor(
    @Optional() router: Router
  ) {

    if (router) {
      console.log('router is available, should register virtual pageviews');
      // TODO: this.service.registerRouterEvents(router.events)
    }


    // TODO: check if production. we want to set things up only on prod

    // TODO inject library programmatically
    /*
      <!-- Global site tag (gtag.js) - Google Analytics -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=UA-85728222-3"></script>
     */




  }

}
