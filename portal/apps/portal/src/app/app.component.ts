import { Component, OnDestroy } from '@angular/core';
import { Log } from '@microgamma/loggator';
import { NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material';

abstract class PortalComponent implements OnDestroy {
  private _subscriptions: Subscription[] = [];
  public isLoading: boolean;


  protected set subscriptions(subscription) {
    this._subscriptions.push(subscription);
  }

  constructor(router: Router, snackBar: MatSnackBar) {

    this.subscriptions = router.events.subscribe((event) => {

      if (event instanceof NavigationStart) {
        this.isLoading = true;
      }

      if (event instanceof NavigationEnd || event instanceof NavigationError) {
        this.isLoading = false;
      }

      if (event instanceof NavigationError) {
        snackBar.open( 'error', `can't navigate to ${event.url}`,{
          duration: 3000
        });
      }

    });
  }

  public ngOnDestroy(): void {
    this._subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}

@Component({
  selector: 'portal-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends PortalComponent {


  @Log()
  private $l;

  constructor(private router: Router, private snackBar: MatSnackBar) {
    super(router, snackBar);
    this.$l.d('constructing', this.constructor.name);

  }

}
