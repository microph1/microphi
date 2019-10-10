import { Component } from '@angular/core';
import { AuthStore } from '../../services/auth/auth.store';

@Component({
  selector: 'portal-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {


  isLoggedIn$ = this.authStore.isAuth$;
  user$ = this.authStore.user$;

  constructor(private authStore: AuthStore) { }

  logout() {
    this.authStore.dispatch('LOGOUT');
  }
}
