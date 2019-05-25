import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Log, setNamespace } from '@microgamma/loggator';

setNamespace('hello-portlet');

@Component({
  // selector: 'hello-portlet',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class AppComponent implements OnInit {

  @Log()
  private $log;


  // TODO this set, get pattern can we extracted to a decorator
  private _title;

  @Input()
  public set title(title) {
    this._title = JSON.parse(title);
  };

  public get title() {
    return this._title;
  }

  @Input()
  public set user(value) {
    this._user = JSON.parse(value);
  }

  public get user() {
    return this._user;
  }

  public _user;


  constructor(private changes: ChangeDetectorRef) {
    this.$log.d('xtructing AppComponent hello-portlet');
    document.dispatchEvent(new Event('portlet:bootstrap'));
    document.addEventListener('portlet:update',() => {
      debugger;
      this.$log.d('got portlet:update');
      this.$log.d('title is', this.title);
      this.$log.d('user is', this.user);
      this.changes.detectChanges();
    });
  }

  ngOnInit(): void {
    document.dispatchEvent(new Event('portlet:ngOnInit'));
  }
}
