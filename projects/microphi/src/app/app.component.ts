import { Component } from '@angular/core';
import { HttpStatusStore } from './services/http/http-status.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public isLoading$ = this.httpStatusStore.isLoading$;

  constructor(private httpStatusStore: HttpStatusStore) {}
}
