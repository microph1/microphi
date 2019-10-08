import { Component } from '@angular/core';
import { of } from 'rxjs';
import { AuthStore } from '../../services/auth/auth.store';
import { map } from 'rxjs/operators';

@Component({
  selector: 'portal-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {


  isLoggedIn$ = this.authStore.isAuth$;

  constructor(private authStore: AuthStore) { }

  logout() {
    this.authStore.dispatch('LOGOUT');
  }
}
