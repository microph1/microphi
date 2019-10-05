import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/internal/operators';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { Log } from '@microgamma/loggator';


interface User {
  id: string
  token: string
  role: string
  realms: string[]
}

@Injectable()
export class AuthService {

  public user$: BehaviorSubject<User> = new BehaviorSubject(null);
  public isAuth$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Log()
  private $l;

  public token$: BehaviorSubject<string> = new BehaviorSubject<string>(localStorage.drugoToken);

  constructor(private http: HttpClient) {}

  public validateToken() {
    return this.http.get(`${environment.apiBase}/users/me`).pipe(
      tap((response: User) => {
        this.$l.d('token validated, user is', response);
        this.user$.next(response);
        this.isAuth$.next(true);
      })
    );
  }


  public authenticate({email, password}): Observable<User> {
    return this.http.post(`${environment.apiBase}/users/auth`, {email, password})
      .pipe(
        tap((response: User) => {
          localStorage.setItem('drugoToken', response.token);
          this.token$.next(response.token);
          this.user$.next(response);
          this.isAuth$.next(true);
        })
      );
  }

  public logout(): void {
    localStorage.removeItem('drugoToken');
    this.token$.next(null);
    this.user$.next(null);
    this.isAuth$.next(false);
  }
}
