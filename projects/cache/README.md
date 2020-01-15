# Cache

A @Cache decorator for Angular. To be used to annotate a method that return an observable (i.e.: HttpClient's methods). It will cache the returned observable for a `ttl` in milliseconds timespan. If `ttl` is not specified the cache will be valid forever until the annotated method is called with different arguments. 

## install 

```bash
yarn add @microphi/cache
``` 

```bash
npm i @microphi/cache
```

## Usage

```typescript
import { Cache } from '@microphi/cache';

@Injectable()
export class UserService {

  constructor(private _client: HttpClient) {}

  @Cache({
    ttl: 2500
  })
  public findAll(id): Observable<any> {
    return this._client.get(`https://reqres.in/api/users?page=${id}`)
  }

}
```
