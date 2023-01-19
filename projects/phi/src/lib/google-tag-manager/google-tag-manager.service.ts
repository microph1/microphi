import { Injectable } from '@angular/core';

@Injectable()
export class GoogleTagManagerService {
  get dataLayer(): any[] {
    return window['dataLayer'] || [];
  }

  public event(event: {k: any}) {
    this.dataLayer.push(event);
  }

}
