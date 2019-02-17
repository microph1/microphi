import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { NavigationStart, Router, RouterEvent } from '@angular/router';
import { Log } from '@microgamma/loggator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @Log()
  private $l;

  @ViewChild('toolbar')
  private toolbar: ToolbarComponent;

  constructor(private auth: AuthService, private router: Router) {

    auth.token$.subscribe((value) => {
      this.$l.d('got token from behavior subject', value);
    });

    auth.isAuthenticated.subscribe((value) => {
      this.$l.d('subscribed to isAuthenticated', value);
    });
  }

  ngOnInit() {
    this.router.events.subscribe((event: RouterEvent) => {
      this.toolbar.isLoading = event instanceof NavigationStart;
    });
  }
}

