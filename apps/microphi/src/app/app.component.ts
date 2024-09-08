import { Component, OnInit } from '@angular/core';
import { of, Subject } from 'rxjs';

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

  public isLoading$ = of(false);

  @Hydra(localStorage)
  public opened: boolean;

  ngOnInit() {
    this.ngOnInit$.next();
  }
}
