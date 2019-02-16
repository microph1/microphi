import { Component } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { BehaviorSubject } from 'rxjs/Rx';
import { AuthToken } from '../services/auth/auth.token.interface';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  public isAuth: BehaviorSubject<AuthToken> = this.authService.token$;
  public isLoading: boolean = false;

  constructor(private authService: AuthService) { }

}
