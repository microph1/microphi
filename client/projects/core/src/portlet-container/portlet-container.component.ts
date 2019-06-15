import { Component, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Log } from '@microgamma/loggator';
import { mergeMap, tap } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { CoreService } from '../lib/core.service';
import { BundleData } from '../lib/bundle-data.interface';


@Component({
  selector: 'app-portlet-container',
  templateUrl: './portlet-container.component.html',
  styleUrls: ['./portlet-container.component.scss']
})
export class PortletContainerComponent implements OnDestroy {


  @Log()
  private $log;

  private portlet;

  constructor(private route: ActivatedRoute, private portletService: CoreService, private elm: ElementRef) {

    route.data.pipe(
      mergeMap((data) => {
        return this.portletService.loadBundle(<BundleData>data);
      }),
      tap((elm) => {
        this.portlet = elm;
      })
    ).subscribe((elm) => {
        this.$log.d('appending elm', elm);
        this.elm.nativeElement.appendChild(elm);

        document.dispatchEvent(new Event('portlet:update:route'));

      });

  }


  public ngOnDestroy(): void {
    this.elm.nativeElement.removeChild(this.portlet);
  }
}
