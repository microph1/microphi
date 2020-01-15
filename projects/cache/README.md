# Cache

A @Cache decorator for Angular.

## install 

```bash
yarn add @microphi/cache
``` 

```bash
npm i @microphi/cache
```

## Usage

```typescript
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
