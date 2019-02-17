import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { mergeMap, tap } from 'rxjs/internal/operators';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { AuthToken } from './auth.token.interface';
import { environment } from '../../../environments/environment';
import { Log } from '@microgamma/loggator';
import { iif } from 'rxjs';
import { flatMap } from 'rxjs/operators';


@Injectable()
export class AuthService {

  @Log()
  private $l;

  private _token: string;
  public get token() {
    if (!this._token && localStorage.drugoToken) {
      this._token = localStorage.drugoToken;
    }

    return this._token;
  }

  public set token(token: string) {
    this._token = token;
    localStorage.drugoToken = token;
    this.token$.next(this._token);
  }

  public token$: BehaviorSubject<string> = new BehaviorSubject<string>(localStorage.drugoToken);

  constructor(private http: HttpClient) {}

  public get isAuthenticated(): Observable<boolean> {
    if  (!this.token) {
      return Observable.of(false);
    }

    // we've got a token stored. Still need to see if it's valid

    return this.http.get(`${environment.apiBase}/users/me`, {
      headers: {
        Authorization: this._token
      }
    })
      .mapTo(true)
      .catch((err) => {
        this.$l.d('unable to validate token', err);
        delete localStorage.drugoToken;
        return Observable.of(false);
      });

  }

  public authenticate({email, password}): Observable<{token: string}> {
    return this.http.post(`${environment.apiBase}/users/auth`, {email, password})
      .pipe(
        tap((token: AuthToken) => this.token = token.token)
      );
  }

}
