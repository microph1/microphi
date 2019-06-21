import { Component } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  user$ = this.authService.user$;
  title$ = of({a: 'cruel', b: 'world'});




  constructor(private authService: AuthService) { }


}
