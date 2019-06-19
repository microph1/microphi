import { Injectable } from '@angular/core';
import { Log } from '@microgamma/loggator';
import { BundleData } from './bundle-data.interface';
import { Observable } from 'rxjs';


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
        // observer.next(this.bundles[bundleName]);
        // observer.complete();
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = bundleUrl;

      script.onerror = (error) => {

        console.error(error);
        observer.error(error);
      };


      script.onload = () => {
        this.$log.d('bundle loaded', bundleName);
        const elm = document.createElement(bundleData.tag);
        this.bundles[bundleName] = elm;
        this.$log.d('creating element', bundleData.tag);

        for (const key of bundleData.inputs) {

          this.$log.d('setting attribute for', key);
          if (bundleData[key]) {
            elm.setAttribute(key, JSON.stringify(bundleData[key]));
          }
        }


        observer.next(elm);
        observer.complete();
      };

      document.body.appendChild(script);

    });

  }

}
