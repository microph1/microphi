import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Log, setNamespace } from '@microgamma/loggator';

setNamespace('hello-portlet');

@Component({
  // selector: 'hello-portlet',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class AppComponent {
  title = 'hello-portlet';

  constructor() {
    console.log('xtructing AppComponent hello-portlet');
    document.dispatchEvent(new Event('portlet:bootstrap'));
  }
}
