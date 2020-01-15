import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Log } from '@microgamma/loggator';
import { Cache } from '@microphi/cache';


interface User {
  id: string;
  token: string;
  role: string;
  realms: string[];
}

@Injectable()
export class AuthService {

  @Log()
  private $l;

  constructor(private http: HttpClient) {}

  @Cache({
    ttl: 2500
  })
  public validateToken(token: string) {
    return this.http.get(`${environment.apiBase}/users/me`, {
      headers: {
        Authorization: token
      }
    });
  }

  public authenticate({email, password}) {
    return this.http.post(`${environment.apiBase}/users/auth`, {email, password});
  }

}
