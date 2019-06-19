import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Log } from '@microgamma/loggator';
import { tap } from 'rxjs/operators';
import { CoreService } from '../lib/core.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-portlet-container',
  templateUrl: './portlet-container.component.html',
  styleUrls: ['./portlet-container.component.scss']
})
export class PortletContainerComponent implements OnInit, OnDestroy {

  private static init: boolean = false;

  @Log()
  private $log;

  private portlet;
  private subscription: Subscription;

  constructor(private route: ActivatedRoute, private portletService: CoreService, private elm: ElementRef, private router: Router) {

    this.$log.d('creating component', this.constructor.name);

  }

  public ngOnInit(): void {
    this.$log.d('running ngOnInit');

    this.subscription = this.route.data.pipe(
      tap((data) => {
        this.$log.d('got data', data);
        this.portlet = document['portlet'];
      })
    ).subscribe((data) => {

      for (const key of data.inputs) {

        this.$log.d('setting attribute for', key);
        if (data[key]) {
          this.portlet.setAttribute(key, JSON.stringify(data[key]));
        }
      }


      // avoid to load portlet twice
      if (this.elm.nativeElement.children.length === 0) {
        this.$log.d('appending elm', this.portlet);
        this.elm.nativeElement.appendChild(this.portlet);
      }

      const portletUpdateRouteEvent = new Event('portlet:update:route');
      portletUpdateRouteEvent['router'] = this.router;
      document.dispatchEvent(portletUpdateRouteEvent);

    });
  }

  public ngOnDestroy(): void {
    this.$log.d('destroying component', this.constructor.name);
    // this.elm.nativeElement.removeChild(this.portlet);
    this.subscription.unsubscribe();
    document.getElementById('script-007').remove();
  }

}
