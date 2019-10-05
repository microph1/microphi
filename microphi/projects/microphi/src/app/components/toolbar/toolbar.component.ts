import { Component } from '@angular/core';
import { of } from 'rxjs';
import { AuthStore } from '../../services/auth/auth.store';

@Component({
  selector: 'portal-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {


  isLoggedIn$ = of(false);

  constructor(private authStore: AuthStore) { }

  logout() {
    // this.authService.logout();
  }
}
