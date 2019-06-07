import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes, UrlHandlingStrategy } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { PortletContainerComponent } from './portlet-container/portlet-container.component';
import { TitleResolver } from './resolvers/title.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { Log } from '@microgamma/loggator';
import { BundleData } from '@microphi/core/lib/bundle-data.interface';
import { Observable } from 'rxjs';
import { PortalUrlHandlingStrategy } from './services/portal-url-handling.strategy';


//
// export class CoreService {
//
//   private static bundles: {
//     [name: string]: HTMLElement
//   } = {};
//
//   // @Log()
//   private static $log = {
//     d: console.log
//   };
//
//   constructor() { }
//
//   public static loadBundle(bundleData: BundleData): Observable<HTMLElement> {
//
//     return new Observable((observer) => {
//
//       const bundleUrl = bundleData.bundleUrl;
//       const bundleName = bundleUrl;
//
//
//       if (this.bundles[bundleName]) {
//         this.$log.d('bundle has already been loaded', bundleName);
//         observer.next(this.bundles[bundleName]);
//         observer.complete();
//         return;
//       }
//
//       const script = document.createElement('script');
//       script.type = 'text/javascript';
//       script.src = bundleUrl;
//
//       script.onerror = (error) => {
//
//         console.error(error);
//         observer.error(error);
//       };
//
//
//       script.onload = () => {
//         this.$log.d('bundle loaded', bundleName);
//         const elm = document.createElement(bundleData.tag);
//         this.bundles[bundleName] = elm;
//         this.$log.d('creating element', bundleData.tag);
//
//         for (const key of bundleData.inputs) {
//
//           this.$log.d('setting attribute for', key);
//           if (bundleData[key]) {
//             elm.setAttribute(key, JSON.stringify(bundleData[key]));
//           }
//         }
//
//
//         observer.next(elm);
//         observer.complete();
//         this.$log.d('sent complete');
//       };
//
//       document.getElementsByTagName('head')[0].appendChild(script);
//
//     });
//
//   }
// }


const helloPortletData: BundleData = {
  bundleUrl: 'http://192.168.254.2:4200/hello-portlet/main.js',
  tag: 'hello-portlet',
  template: `
        <hello-portlet [title]="title" [user]="user"></hello-portlet>
      `,
  inputs: ['title', 'user']
};

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'hp',
    children: [
      {
        path: '**',
        component: PortletContainerComponent,
        data: helloPortletData,
        resolve: {
          title: TitleResolver,
          user: UserResolver
        }
      }
    ]

  },
  // {
  //   path: 'hp-lazy',
  //   component: PortletContainerComponent,
  //   data: helloPortletData,
  //   loadChildren: () => CoreService.loadBundle(helloPortletData).toPromise().then((m) => {
  //     console.log('module loaded', m);
  //   })
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: false
  })],
  exports: [RouterModule],
  providers: [
    TitleResolver,
    UserResolver,
    // {
    //   provide: UrlHandlingStrategy,
    //   useClass: PortalUrlHandlingStrategy
    // }
  ]
})
export class AppRoutingModule {

  @Log()
  private $log;

  private portletRoutesLoad$ = Observable.fromEvent(document, 'portlet:provide:routes');

  constructor(router: Router) {

    document.addEventListener('portlet:provide:routes', (ev) => {
      this.$log.d('got routes', ev['routes']);


      // TODO check if route is allowed
      this.$log.d('firing portlet:update:route');
      document.dispatchEvent(new Event('portlet:update:route'));

    });

    // Observable.combineLatest([
    //   router.events.pipe(filter((ev) => {
    //     return ev instanceof NavigationStart
    //   })),
    //   this.portletRoutesLoad$.pipe(
    //     tap((ev) => {
    //       this.$log.d('got routes', ev['routes']);
    //       RouterModule.forChild(routes);
    //     })
    //   )
    // ]).subscribe((navigationEnds, portletRoutes) => {
    //   this.$log.d('args', navigationEnds, portletRoutes);
    //   debugger;
    // });

    router.events
      .pipe(
        // filter((ev) => {
        //   return ev instanceof ChildActivationStart
        // })
      )
      .subscribe(this.$log.d);
  }

}
