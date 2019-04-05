import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { switchMap } from 'rxjs/operators';
import { tap } from 'rxjs/internal/operators/tap';
import { last } from 'rxjs/internal/operators/last';

@Injectable()
export class FileService {

  private baseUrl = environment.apiBase;

  constructor(private http: HttpClient) { }

  public upload(file: File) {
    return this.http.post(`${this.baseUrl}/getSignedUrl`, {
      metadata: {filename: file.name}
    }).pipe(
      switchMap((response: {url: string}) => {
        return this.http.put(response.url, file, {
          reportProgress: true,
          observe: 'events',
          responseType: 'text'
        });
      }),
      tap((event) => {
        console.log('upload event', event)
      }),
      last()
    );
  }
}
