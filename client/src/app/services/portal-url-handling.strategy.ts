import { UrlHandlingStrategy, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { Log } from '@microgamma/loggator';

@Injectable()
export class PortalUrlHandlingStrategy extends UrlHandlingStrategy {
  @Log()
  private $l;

  extract(url: UrlTree): UrlTree {
    this.$l.d('extracting', url.toString());
    this.$l.d('root', url.root);
    this.$l.d('fragment', url.fragment);
    return url;
  }

  merge(newUrlPart: UrlTree, rawUrl: UrlTree): UrlTree {
    this.$l.d('merging', newUrlPart.toString(), rawUrl.toString());
    this.$l.d('newPart root', newUrlPart.root);
    this.$l.d('newPart fragment', newUrlPart.fragment);
    this.$l.d('rawPart root', rawUrl.root);
    this.$l.d('rawPart fragment', rawUrl.fragment);

    return newUrlPart;
  }

  shouldProcessUrl(url: UrlTree): boolean {
    this.$l.d('shouldProcessUrl', url.toString());
    this.$l.d('root', url.root);
    this.$l.d('fragment', url.fragment);


    return true;
  }

}
