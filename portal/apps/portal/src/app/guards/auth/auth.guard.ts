import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { filter, flatMap, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(next: ActivatedRouteSnapshot) {
    return this.authService.token$.pipe(
      filter((token) => {
        return !!token;
      }),
      flatMap(() => {
        // return this.authService.validateToken();
        return of(true);
      }),
      map((response) => {
        return !!response;
      })
    )
  }
}
