import { Component } from '@angular/core';
import { NgxHttpStatusStore } from '@microphi/ngx-http-status';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public isLoading$ = this.httpStatusStore.isLoading$;

  constructor(private httpStatusStore: NgxHttpStatusStore) {}
}
