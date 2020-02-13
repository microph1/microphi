/* tslint:disable:no-string-literal */
import { Inject, ModuleWithProviders, NgModule, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleTagManagerService } from './google-tag-manager.service';
import { GOOGLE_TAG_MANAGER_UID } from './tokens';
import { GoogleTagManagerOptions } from './googlet-tag-manager-options';
import { NavigationEnd, Router } from '@angular/router';

/**
 * # GoogleTagManager
 * Usage:
 * ```typescript
 *   @NgModule({
 *   declarations: [AppComponent],
 *   imports: [
 *     [...]
 *     GoogleTagManagerModule.forRoot({
 *       trackId: 'UA-xxxxx-xx'
 *     })
 *   ]
 *   })
 *   export class AppModule {}
 * ```
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  providers: [
    GoogleTagManagerService
  ]
})
export class GoogleTagManagerModule {

  constructor(
    @Inject(GOOGLE_TAG_MANAGER_UID) trackId,
    @Optional() router: Router
  ) {

    this.initializeGTM({
      trackId: trackId
    });

    // if (router) {
    //   console.log('router is available, registering virtual pageviews');
    //
    //   router.events.subscribe((event) => {
    //     if (event instanceof NavigationEnd) {
    //
    //
    //     }
    //   })
    // }

  }

  public static forRoot(options: GoogleTagManagerOptions): ModuleWithProviders<GoogleTagManagerModule> {

    return {
      ngModule: GoogleTagManagerModule,
      providers: [
        {
          provide: GOOGLE_TAG_MANAGER_UID,
          useValue: options.trackId
        }
      ]
    };
  }

  private initializeGTM(options: GoogleTagManagerOptions) {


    window['dataLayer'] = window['dataLayer'] || [];
    // tslint:disable-next-line:only-arrow-functions
    window['gtag'] = window['gtag'] || function() {
      window['dataLayer'].push(arguments);
    };

    // for (const command of $settings.initCommands) {
    //   window['gtag'](command.command, ...command.values);
    // }

    window['gtag']('js', new Date());
    window['gtag']('config', options.trackId);


    const s: HTMLScriptElement = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${options.trackId}`;

    const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
    head.appendChild(s);
  }
}
