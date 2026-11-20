import { HttpInterceptorFn } from '@angular/common/http';
import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { from, switchMap } from 'rxjs';
import { AuthKit, AUTHKIT_OPTIONS, AuthKitOptions } from './authkit.js';

/**
 * AuthKit for the app: the `AuthKit` session, started before the first
 * navigation (so the callback URL completes the sign-in). Also add
 * `withInterceptors([authKitInterceptor])` to `provideHttpClient`, and route
 * the callback path to `authKitCallback`.
 */
export function provideAuthKit(options: Partial<AuthKitOptions> = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: AUTHKIT_OPTIONS,
      useValue: { configUrl: '/api/config', callbackPath: '/callback', apiPrefix: '/api/', devMode: true, ...options },
    },
    // A factory, not a class provider: the package is built by tsc, with no Angular compiler metadata.
    { provide: AuthKit, useFactory: () => new AuthKit() },
    provideAppInitializer(() => inject(AuthKit).init()),
  ]);
}

/** Adds the access token to the app's own API calls only: relative `apiPrefix` URLs, the config aside. */
export const authKitInterceptor: HttpInterceptorFn = (req, next) => {
  const { apiPrefix, configUrl } = inject(AUTHKIT_OPTIONS);
  if (!req.url.startsWith(apiPrefix) || req.url === configUrl) {
    return next(req);
  }
  return from(inject(AuthKit).accessToken()).pipe(
    switchMap((token) => next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req)),
  );
};

/** Signed in, or off to sign in and back to where they were going. */
export const signedIn: CanActivateFn = (_route, state) => {
  const auth = inject(AuthKit);
  if (auth.signedIn()) {
    return true;
  }
  if (auth.available()) {
    void auth.signIn(state.url);
  }
  return false;
};

/**
 * The callback route: `{ path: 'callback', canActivate: [authKitCallback], children: [] }`.
 * The code exchange already happened in `AuthKit.init`; this moves on to the
 * page the user signed in from.
 */
export const authKitCallback: CanActivateFn = () => inject(Router).parseUrl(inject(AuthKit).returnTo);
