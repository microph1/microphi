import { Cache } from './cache.decorator';
import { of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

describe('@Cache', () => {

  let instance;

  beforeEach(() => {
    class AppService {

      private tick = 0;

      @Cache({
        ttl: 1000
      })
      public cached() {
        return of(++this.tick);
      }
    }
    instance = new AppService();

  });

  it('should cache calls done in less than ttl', fakeAsync(() => {
    instance.cached().subscribe((t) => {
      expect(t).toEqual(1);
    });

    tick(100);
    instance.cached().subscribe((t) => {
      expect(t).toEqual(1);
    });

  }));


  it('should not cache calls made in more than ttl', fakeAsync(() => {
    instance.cached().subscribe((t) => {
      expect(t).toEqual(1);
    });

    tick(1000);
    instance.cached().subscribe((t) => {
      expect(t).toEqual(2);
    });


  }));
});
