import { Component, ViewChild } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { Log } from '@microgamma/loggator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @Log()
  private $l;

  @ViewChild('toolbar', { static: true })
  private toolbar: ToolbarComponent;
  public user$ = this.auth.user$;

  constructor(private auth: AuthService) {}

}

