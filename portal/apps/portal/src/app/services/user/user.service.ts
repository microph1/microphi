import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cache } from '../../decorators/cache/cache.decorator';
import { Log } from '@microgamma/loggator';
import { tap } from 'rxjs/operators';


@Injectable()
export class UserService {

  @Log()
  private $log;

  constructor(private _client: HttpClient) {}

  @Cache({
    ttl: 2000
  })
  public findAll(): Observable<any> {
    return this._client.get(`https://72cigfl7hc.execute-api.eu-west-2.amazonaws.com/dev/users`).pipe(
      tap(() => {
        this.$log.d('endpoint hit');
      }),

    );
  }

}
