import { delay, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { HttpActions, HttpStatusStore } from './http-status.store';

@Injectable()
export class HttpStatusInterceptor implements HttpInterceptor {
  constructor(private httpStatusStore: HttpStatusStore) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    this.httpStatusStore.dispatch('REQUEST');

    // extend server response observable with logging
    return next.handle(req)
      .pipe(
        delay(100),
        tap(
          // Succeeds when there is a response; ignore other events
          () => {
            this.httpStatusStore.dispatch('RESPONSE');

          },
          // Operation failed; error is an HttpErrorResponse
          (error) => {
            this.httpStatusStore.dispatch('ERROR');
          }
        )
      );
  }
}
