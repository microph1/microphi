import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Log } from '@microgamma/loggator';
import { BundleData } from './bundle-data.interface';


@Injectable({
  providedIn: 'root'
})
export class CoreService {

  private bundles: {
    [name: string]: HTMLElement
  } = {};

  @Log()
  private $log;

  constructor() { }

  public loadBundle(bundleData: BundleData): Observable<HTMLElement> {

    return new Observable((observer) => {

      const bundleUrl = bundleData.bundleUrl;
      const bundleName = bundleUrl;


      if (this.bundles[bundleName]) {
        this.$log.d('bundle has already been loaded', bundleName);
        observer.next(this.bundles[bundleName]);
        observer.complete();
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = bundleUrl;

      script.onerror = (error) => {
        // resolve({script: name, loaded: false, status: 'Loaded'});
        console.error(error);
        observer.error(error);
      };


      script.onload = () => {
        this.$log.d('bundle loaded', bundleName);
        const elm = document.createElement(bundleData.tag);
        this.bundles[bundleName] = elm;
        this.$log.d('creating element', bundleData.tag);

        observer.next(elm);
        observer.complete();
        this.$log.d('sent complete');
      };

      document.getElementsByTagName('head')[0].appendChild(script);

    });

  }
}
