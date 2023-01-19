import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthStore } from '../../services/auth/auth.store';

@Injectable()
export class NoAuthGuard implements CanActivate {
  constructor(private authStore: AuthStore) {}

  canActivate() {
    return this.authStore.isAuth$.pipe(map((isAuth) => !isAuth));
  }
}
