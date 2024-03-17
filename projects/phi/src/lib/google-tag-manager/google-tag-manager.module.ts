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

  private static options: GoogleTagManagerOptions;

  constructor(
    @Inject(GOOGLE_TAG_MANAGER_UID) trackId,
    @Optional() router: Router
  ) {

    if (GoogleTagManagerModule.options.enable) {

      this.initializeGTM({
        trackId: trackId
      });

      if (GoogleTagManagerModule.options.trackPageViews && router) {

        if (router) {

          router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
              window['dataLayer'].push('pageview');

            }
          });
        }
      }
    }


  }

  public static forRoot(options: GoogleTagManagerOptions): ModuleWithProviders<GoogleTagManagerModule> {
    GoogleTagManagerModule.options = options;

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
    window['gtag'] = window['gtag'] || function(...args) {
      window['dataLayer'].push(args);
    };

    window['gtag']('js', new Date());
    window['gtag']('config', options.trackId);

    if (options.commands) {
      for (const command of options.commands) {
        const {k, v} = command;
        window['gtag'](k, v);
      }
    }



    const s: HTMLScriptElement = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${options.trackId}`;

    const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
    head.appendChild(s);
  }
}
