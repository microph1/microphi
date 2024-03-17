import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthStore } from '../services/auth/auth.store';

@Pipe({
  name: 'isLoggedIn'
})
@Injectable()
export class IsLoggedInPipe implements PipeTransform {

  constructor(private authStore: AuthStore) {}

  transform(): Observable<boolean> {
    return this.authStore.isAuth$;
  }

}
