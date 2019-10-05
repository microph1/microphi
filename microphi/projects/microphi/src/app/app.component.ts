import { Component } from '@angular/core';
import { AuthStore, RestActions } from './services/auth/auth.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'microphi';
  isLoading$ = this.authStore.loading$;

  constructor(private authStore: AuthStore) {}

  auth() {
    this.authStore.dispatch(RestActions.REQUEST, {
      email: 'davide@bazooka',
      password: 'password2'
    });
  }
}
