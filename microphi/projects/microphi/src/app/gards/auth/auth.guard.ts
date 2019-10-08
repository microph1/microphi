import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { AuthStore } from '../../services/auth/auth.store';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authStore: AuthStore) {}

  canActivate(next: ActivatedRouteSnapshot) {
    return this.authStore.isAuth$;
  }
}
