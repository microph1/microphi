import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class TokenBearerInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    console.log('token is', this.authService.token$.getValue());
    if (this.authService.token$.getValue()) {
      request = request.clone({
        setHeaders: {
          Authorization: `${this.authService.token$.getValue()}`
        }
      });
    }

    return next.handle(request);
  }
}
