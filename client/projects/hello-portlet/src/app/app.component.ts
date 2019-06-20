import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Log, setNamespace } from '@microgamma/loggator';

setNamespace('hello-portlet');

@Component({
  // selector: 'hello-portlet',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class AppComponent {

  @Log()
  private $log;


  @Input()
  private title;


  @Input()
  public user;

}
