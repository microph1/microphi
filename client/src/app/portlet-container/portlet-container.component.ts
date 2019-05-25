import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Log } from '@microgamma/loggator';
import { CoreService } from '@microphi/core';
import { delay, map, mergeMap, tap } from 'rxjs/operators';
import { combineLatest, Observable, Subject } from 'rxjs';
import { BundleData } from '@microphi/core/lib/bundle-data.interface';


@Component({
  selector: 'app-portlet-container',
  templateUrl: './portlet-container.component.html',
  styleUrls: ['./portlet-container.component.scss']
})
export class PortletContainerComponent implements OnInit, AfterViewInit {


  @Log()
  private $log;

  @ViewChild('portletOutlet') outlet: ElementRef;

  private portlet;

  private afterViewInit$ = new Subject();

  constructor(private route: ActivatedRoute, private portletService: CoreService) {

    const allData = combineLatest(
      route.data.pipe(
        map((data) => {
          return {
            bundleUrl: data.bundleUrl,
            tag: data.tag
          }
        }),
        mergeMap((data) => {
          return this.portletService.loadBundle(data);
        }),
        tap((elm) => {
          this.portlet = elm;
        })
      ),
      this.afterViewInit$
    );

    allData.subscribe(([elm, afterViewInit]) => {
      this.$log.d('subscribed to all data', elm, afterViewInit);
      this.$log.d('outlet is', this.outlet);
      this.outlet.nativeElement.appendChild(elm);
    });

  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.$log.d('running ngAfterViewInit');
    this.afterViewInit$.next(this.outlet);
    this.afterViewInit$.complete();
  }

}
