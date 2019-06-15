import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class XApiKeyInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    request = request.clone({
      setHeaders: {
        'x-api-key': 'd41d8cd98f00b204e9800998ecf8427e'//'KEEZ0zh2Kl5JzyG0wpJ3b4kY5DdJ8UhX2DjKIt3Y'
      }
    });

    return next.handle(request);
  }
}
