import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UserService {

  constructor(private http: HttpClient) { }


  public findAll() {
    return this.http.get('https://bx951jmtxh.execute-api.eu-west-2.amazonaws.com/dev');
  }
}
