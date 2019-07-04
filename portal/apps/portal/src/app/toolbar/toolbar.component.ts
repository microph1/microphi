import { Component } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'portal-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {
  public isAuth$ = this.authService.isAuthenticated;

  constructor(private authService: AuthService) { }

  logout() {
    this.authService.logout();
  }
}
