import { Component, OnInit } from '@angular/core';
import { HydrateFrom } from '@microphi/phi';
import { HttpClient } from '@angular/common/http';
import { HttpStatusStore } from '@microphi/store';
import { Subject } from 'rxjs';
import { mergeMapTo } from 'rxjs/operators';

export interface ProjectDef {
  name: string;
  uri: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private ngOnInit$ = new Subject();

  public isLoading$ = this.httpStatusStore.isLoading$.pipe(
    mergeMapTo(this.ngOnInit$),
  );

  @HydrateFrom(localStorage)
  public opened: boolean;

  constructor(private httpStatusStore: HttpStatusStore, private http: HttpClient) {}

  ngOnInit() {
    this.ngOnInit$.next();
  }
}
