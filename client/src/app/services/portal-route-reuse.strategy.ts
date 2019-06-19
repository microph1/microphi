import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class PortalRouteReuseStrategy implements RouteReuseStrategy {
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return undefined;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {

    console.log('should attach', route.url.toString());

    if (route.url.toString().indexOf('hp')) {
      return true;
    }

    return false;
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    console.log('should detach', route.url.toString());
    if (route.url.toString().indexOf('hp') > 0) {
      return false;
    }

    return false;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    console.log('should reuse', future, curr);
    return false;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    console.log('should store', route, handle);
  }

}
