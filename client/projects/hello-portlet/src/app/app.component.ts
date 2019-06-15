import { ChangeDetectorRef, Component, Input, ViewEncapsulation, ɵdetectChanges, ɵmarkDirty } from '@angular/core';
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


  // TODO this set, get pattern can b e extracted to a decorator
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

  constructor(private changeDetector: ChangeDetectorRef) {

  }

  onActivate($event: any) {
    const component = $event;

    component.user = this.user;
    this.changeDetector.detectChanges();
  }
}
