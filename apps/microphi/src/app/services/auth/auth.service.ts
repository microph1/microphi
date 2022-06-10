import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cache } from '@microphi/cache';
import { Observable } from 'rxjs';
import { User } from './auth.store';


@Injectable()
export class AuthService {

  constructor(private http: HttpClient) {}

  @Cache({
    ttl: 2500
  })
  public validateToken(token: string): Observable<User> {
    return this.http.get<User>(`${environment.apiBase}/users/me`, {
      headers: {
        Authorization: token
      }
    });
  }

  public authenticate({email, password}: {email: string, password: string}): Observable<User> {
    return this.http.post<User>(`${environment.apiBase}/users/auth`, {email, password});
  }

}
