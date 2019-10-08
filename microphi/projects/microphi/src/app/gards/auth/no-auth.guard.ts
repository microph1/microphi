import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { filter, flatMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthStore } from '../../services/auth/auth.store';

@Injectable()
export class NoAuthGuard implements CanActivate {
  constructor(private authStore: AuthStore) {}

  canActivate(next: ActivatedRouteSnapshot) {
    return this.authStore.isAuth$.pipe(map((isAuth) => !isAuth));
  }
}
