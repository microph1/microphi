import { Component, OnInit } from '@angular/core';
import { HydrateFrom } from '@microphi/phi';
import { HttpClient } from '@angular/common/http';
import { of, Subject } from 'rxjs';
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
  private ngOnInit$ = new Subject<void>();

  public isLoading$ = of(false)

  @HydrateFrom(localStorage)
  public opened: boolean;

  constructor() {}

  ngOnInit() {
    this.ngOnInit$.next();
  }
}
