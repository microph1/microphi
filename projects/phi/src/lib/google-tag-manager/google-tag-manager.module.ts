/* tslint:disable:no-string-literal */
import { Inject, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleTagManagerService } from './google-tag-manager.service';
import { GOOGLE_TAG_MANAGER_UID } from './tokens';

/**
 * Import GoogleTagManagerModule to enable analytics
 * Usage:
 * ```typescript
 *   @NgModule({
 *   declarations: [AppComponent],
 *   imports: [
 *     [...]
 *     GoogleTagManagerModule
 *   ],
 *
 *   providers: [
 *     {
 *       provide: GOOGLE_TAG_MANAGER_UID,
 *       useValue: 'UA-85728222-2'
 *     }
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

  constructor(@Inject(GOOGLE_TAG_MANAGER_UID) uid) {

    window['dataLayer'] = window['dataLayer'] || [];

    function gtag(...args) {
      // @ts-ignore
      dataLayer.push(arguments);
    }

    if (!uid) {
      console.warn(this.constructor.name, ': You should provide a UID. Skipping GTM registration');
    } else {
      gtag('js', new Date());
      gtag('config', uid);
    }
  }
}
