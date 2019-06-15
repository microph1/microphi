import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class UserResolver implements Resolve<any> {

  constructor(private authService: AuthService) {}


  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.user$;
  }
}
