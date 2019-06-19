import { ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { Log, setNamespace } from '@microgamma/loggator';
import { fromEvent, Subscription } from 'rxjs';

setNamespace('hello-portlet');

@Component({
  // selector: 'hello-portlet',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class AppComponent {

  @Log()
  private $log;


  // TODO this set, get pattern can b e extracted to a decorator
  private _title;
  private subscriptions: Subscription[] = [];

  @Input()
  public set title(title) {
    // this._title = JSON.parse(title);
    this._title = title;
  }

  public get title() {
    return this._title;
  }

  @Input()
  public set user(value) {
    // this._user = JSON.parse(value);
    this._user = value;
  }

  public get user() {
    return this._user;
  }

  public _user;

  private urlChange$ = fromEvent(document, 'portal:NavigationEnd');
  hash: any;

  constructor(private changeDetector: ChangeDetectorRef) {

    this.$log.d('bootstrapping portlet component');
    this.$log.d(window.location);

    this.subscriptions.push(this.urlChange$.subscribe((value) => {
      this.$log.d('url changed', value);
      this.$log.d(window.location.href);
      this.$log.d('should show component at', window.location.hash);
      this.hash = window.location.hash;
      this.changeDetector.detectChanges();
    }));
  }

  // constructor(
  //   private changeDetector: ChangeDetectorRef,
  //   // private router: Router
  // ) {

    // this.router.events.pipe(
    // ).subscribe(this.$log.d);


    // document.addEventListener('portlet:update:route', (ev) => {
    //   const portalRouter: Router = ev['router'];
    //   //
    //   // const config = portalRouter.config;
    //   //
    //   // config[2].children = routes;
    //   //
    //   // this.$log.d('portal routing configuration', portalRouter);
    //   //
    //   //
    //   // portalRouter.resetConfig(config);
    //
    //   // this.$log.d('augmented routing configuration', portalRouter);
    //   this.$log.d('running portlet navigation');
    //   this.$log.d('portal url', portalRouter.url);
    //   this.$log.d('portlet url', router.url);
    //   this.$log.d('current router', router);
    //
    //   const portletUrl = portalRouter.url.substring(4);
    //   this.$log.d('will navigate to', portletUrl);
    //   // this.router.initialNavigation();
    //
    //   this.router.navigateByUrl(portletUrl);
    //
    // });
  // }

//   onActivate($event: any) {
//     const component = $event;
//
//     this.$log.d('activating component', component);
//     component.user = this.user;
//     this.changeDetector.detectChanges();
//   }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();

    });
  }
}
