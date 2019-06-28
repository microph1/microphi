import { ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { fromEvent } from 'rxjs';

@Component({
  // selector: 'portal-root',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ProfileComponent {

  @Input()
  public title;

  @Input()
  public user;


  private portalNavigationEnd$ = fromEvent(document, 'portal:NavigationEnd');

  constructor(private changeDetection: ChangeDetectorRef) {
    this.portalNavigationEnd$.subscribe((ev) => {
      this.changeDetection.markForCheck();
    });
  }
}
