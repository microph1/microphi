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
    this.$l.d('newPart root', newUrlPart);
    this.$l.d('rawPart fragment', rawUrl);

    // when navigating from / to /hp/a
    // newPart /hp/a
    // rawUrl /

    // we need to remove the 'a' part

    // if (newUrlPart.toString().endsWith('a')) {
    //   newUrlPart.root.segments.pop();
    // }

    return newUrlPart;
  }

  shouldProcessUrl(url: UrlTree): boolean {
    this.$l.d('shouldProcessUrl', url.toString(), url);
    // this.$l.d('root', url.root);
    // this.$l.d('fragment', url.fragment);

    // return url.toString().indexOf('a') < 0;

    // if (url.toString().endsWith('hp/a') || url.toString().endsWith('hp/b')) {
    //   return false;
    // }
    return true;
  }

}
