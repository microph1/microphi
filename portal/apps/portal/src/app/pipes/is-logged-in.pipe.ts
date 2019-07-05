import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Pipe({
  name: 'isLoggedIn'
})
@Injectable()
export class IsLoggedInPipe implements PipeTransform {

  constructor(private authService: AuthService) {}

  transform(value: any, args?: any): Observable<boolean> {
    return this.authService.user$.pipe(map((user) => !!user && !!user._id));
  }

}
