import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, mapTo, tap } from 'rxjs/internal/operators';
import { AuthToken } from './auth.token.interface';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { Log } from '@microgamma/loggator';


@Injectable()
export class AuthService {

  public user$: ReplaySubject<{}> = new ReplaySubject(1);

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
      return of(false);
    }

    // we've got a token stored. Still need to see if it's valid

    return this.http.get(`${environment.apiBase}/users/me`, {
      headers: {
        Authorization: this._token
      }
    }).pipe(
      catchError((err) => {
        this.$l.d('unable to validate token', err);
        delete localStorage.drugoToken;
        return of(false);
      }),
      tap((user) => {
        this.$l.d('user is', user);
        this.user$.next(user);
        this.user$.complete();
      }),
      mapTo(true)
    )


  }

  public authenticate({email, password}): Observable<{token: string}> {
    return this.http.post(`${environment.apiBase}/users/auth`, {email, password})
      .pipe(
        tap((token: AuthToken) => this.token = token.token)
      );
  }

  public logout() {
    this.token = '';
    return this.isAuthenticated;
  }
}
