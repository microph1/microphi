import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/internal/operators';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { AuthToken } from './auth.token.interface';



@Injectable()
export class AuthService {

  private _token: AuthToken;
  public get token() {
    return this._token;
  }

  public set token(token: AuthToken) {
    this._token = token;
    this.token$.next(this._token);
  }

  public token$: BehaviorSubject<AuthToken> = new BehaviorSubject<AuthToken>(this._token);

  constructor(private http: HttpClient) {}

  public authenticate({email, password}): Observable<{token: string}> {
    return this.http.post('//192.168.254.2:3000/auth',{email, password})
      .pipe(
        tap((token: AuthToken) => this.token = token)
      );
  }

}
