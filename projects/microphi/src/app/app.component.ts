import { Component } from '@angular/core';
import { HydrateFrom } from '@microphi/phi';
import { HttpClient } from '@angular/common/http';
import { HttpStatusStore } from '@microphi/store';

export interface ProjectDef {
  name: string;
  uri: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public isLoading$ = this.httpStatusStore.isLoading$;

  public projects$ = this.http.get<ProjectDef[]>('/assets/docs/index.json');

  @HydrateFrom(localStorage)
  public opened: boolean;


  constructor(private httpStatusStore: HttpStatusStore, private http: HttpClient) {}
}
