import { Component } from '@angular/core';
import { AuthActions, AuthStore } from '../../services/auth/auth.store';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {


  isLoggedIn$ = this.authStore.isAuth$;
  user$ = this.authStore.user$;

  constructor(private authStore: AuthStore) { }

  logout() {
    this.authStore.dispatch(AuthActions.LOGOUT);
  }
}
