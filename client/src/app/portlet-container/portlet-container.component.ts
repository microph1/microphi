import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Log } from '@microgamma/loggator';
import { CoreService } from '@microphi/core';
import { mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { BundleData } from '@microphi/core/lib/bundle-data.interface';


@Component({
  selector: 'app-portlet-container',
  templateUrl: './portlet-container.component.html',
  styleUrls: ['./portlet-container.component.scss']
})
export class PortletContainerComponent {


  @Log()
  private $log;


  private portletOnInit$ = Observable.fromEvent(document, 'portlet:ngOnInit');

  public isLoading: boolean = true;

  constructor(private route: ActivatedRoute, private portletService: CoreService, private elm: ElementRef) {



    route.data.pipe(
      mergeMap((data) => {
        return this.portletService.loadBundle(data as BundleData);
      })
    ).subscribe((elm) => {
        this.$log.d('appending elm', elm);
        this.elm.nativeElement.appendChild(elm);
        this.isLoading = false;

      });

    // TODO all events need to be put in a abstract class for ease of access
    // TODO events must be scoped using portlet container as source
    this.portletOnInit$.subscribe((event) => {
      this.$log.d('portlet run ngOnInit', event);
      this.$log.d('dispatching event update event');
      document.dispatchEvent(new Event('portlet:update'));
    })

  }


}
