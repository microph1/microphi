import { Component } from '@angular/core';
import { Log } from '@microgamma/ts-debug';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
  @Log()
  private $l;

  constructor() {
    this.$l.d('constructing');
  }
}

