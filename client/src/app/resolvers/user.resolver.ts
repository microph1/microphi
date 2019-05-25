import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class UserResolver implements Resolve<any> {


  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log('resolving user');
    return Observable.of({
      name: 'a-user',
      role: 'pawn'
    });
  }
}
