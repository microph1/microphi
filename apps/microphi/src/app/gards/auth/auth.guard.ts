import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthStore } from '../../services/auth/auth.store';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authStore: AuthStore) {}

  canActivate() {
    return this.authStore.isAuth$;
  }
}
