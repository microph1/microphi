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
    ttl: 2500
  })
  public findAll(id): Observable<any> {
    return this._client.get(`https://reqres.in/api/users?page=${id}`).pipe(
      tap(() => {
        this.$log.d('endpoint hit');
      })
    );
  }

}
