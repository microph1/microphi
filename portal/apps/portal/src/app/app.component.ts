import { Component } from '@angular/core';
import { of } from 'rxjs';
import { Log } from '@microgamma/loggator';

@Component({
  selector: 'portal-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  hello$ = of('Hello cruel world!!!!');


  @Log()
  private $l;

  constructor() {
    this.$l.d('constructing', this.constructor.name);

  }

}
